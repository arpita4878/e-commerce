from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
import rapidfuzz
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017")
db = client["ecommerce"]
product_collection = db["products"]


class SearchRequest(BaseModel):
    q: str


@app.post("/search")
def search_products(data: SearchRequest):
    q = data.q.strip().lower()

    mongo_products = list(
        product_collection.find(
            {}, {"_id": 1, "name": 1, "description": 1, "category": 1, "keywords": 1}
        )
    )

    products = [
        {
            "id": str(p["_id"]),
            "name": p.get("name", ""),
            "description": p.get("description", ""),
            "category": p.get("category", "Uncategorized"),
            "keywords": p.get("keywords", []),
        }
        for p in mongo_products
    ]

    if not products:
        return {"results": [], "suggestions": [], "recommendations": []}

    regex_matches = [
        p
        for p in products
        if q in p["name"].lower()
        or q in p["description"].lower()
        or any(q in kw.lower() for kw in p["keywords"])
    ]

    fuzzy_ranked = sorted(
        products,
        key=lambda p: max(
            rapidfuzz.fuzz.token_sort_ratio(p["name"].lower(), q),
            max(
                (rapidfuzz.fuzz.token_sort_ratio(kw.lower(), q) for kw in p["keywords"]),
                default=0,
            ),
        ),
        reverse=True,
    )

    fuzzy_filtered = []
    for p in fuzzy_ranked:
        score = max(
            rapidfuzz.fuzz.token_sort_ratio(p["name"].lower(), q),
            max(
                (rapidfuzz.fuzz.token_sort_ratio(kw.lower(), q) for kw in p["keywords"]),
                default=0,
            ),
        )
        if score > 30:
            fuzzy_filtered.append({**p, "score": score})

    seen = set()
    final_results = []
    for p in regex_matches + fuzzy_filtered:
        if p["id"] not in seen:
            seen.add(p["id"])
            final_results.append(p)

    
    final_results = final_results[:10]

    suggestions = [p["name"] for p in final_results[:5]]

    recommendations = []
    if final_results:
        top_category = final_results[0]["category"]
        recommendations = [
            p
            for p in products
            if p["category"] == top_category and p["id"] != final_results[0]["id"]
        ][:5]

    return {
        "results": final_results,
        "suggestions": suggestions,
        "recommendations": recommendations,
    }
