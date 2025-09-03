## PATH
@Rpitaseth1603-chatgpt

## for login
http://localhost:5000/users/login
{
    "email": "seth@gmail.com",
    "password":"123456"
}


## register
http://localhost:5000/users/register
{
	"email": "seth@gmail.com",
    "password":"123456",
    "name":"seth",
    "confirmpassword":"123456",
    "role":"super_admin"
}


## forgot-password
http://localhost:5000/users/forgot-password
{ "password": "new1234" }

it give you a token and redirect a link
http://localhost:5000/users/reset/d3ceda3ee2275ea0a6f703100c1a7abab56bf89e771dec87b1916f101c0cb310
{ "password": "12345678" }


## change-password
http://localhost:5000/users/change-password
{ "userId":"seth@gmail.com",
    "oldPassword": "12345678", "newPassword": "123456" }

email---get from local storage 



## delete user
http://localhost:5000/users/delete
{
  "email": "test@gmail.com"
}

## update
http://localhost:5000/users/updateUser
{
  "condition_obj": {
    "email": "test@gmail.com"
  },
  "content_obj": {
    "name": "testing"
  }
}

## get data 
for all-------http://localhost:5000/users/getdata

for specfic--------params------email---demo@gmail.com



----------------------------------------------------------------------------------------

## PRODUCT


## add product globally super admin 
post-----http://localhost:5000/api/products

{
  "name": "Samsung Galaxy S24 Ultra",
  "sku": "SG-S24U-001",
  "brand": "Samsung",
  "category": "Smartphones",
  "description": "The Samsung Galaxy S24 Ultra features a 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, up to 12GB RAM, and 200MP camera for flagship performance and photography.",
  "basePrice": 124999,
  "taxRate": 18,
  "attributes": {
    "color": "Phantom Black",
    "storage": "256GB",
    "ram": "12GB",
    "battery": "5000mAh"
  },
  "isActive": true
  keywords:{
    "mobile",
    "phone"
  }
}


## fetch product specific
get--------http://localhost:5000/api/products/1


## fetch product all
get--------http://localhost:5000/api/products

## update product
put ----http://localhost:5000/api/products/update/68b6df41832cd0e5bf56e92a

68b6df41832cd0e5bf56e92a----product id
{
    "basePrice":124299
}

## delete product
delete---http://localhost:5000/api/products/update/68b6df41832cd0e5bf56e92a

-------------------------------------------------------------------
## INVENTORY


## for specific branch inventory 
post----http://localhost:5000/api/inventory/mine
(using product id here change price of product acc to branch manager)
{
  "productId": "1",

  "price": 279,
  "quantity": 45,
  "lowStockThreshold": 5
}


---------------------------------------------------------------------------------------

## BRANCH



## for branch create
post-------------http://localhost:5000/api/branches
{
  "name": "Main Branch",
  "code": "MB001",
  "address": "xyz",
  "location": { "type": "Point", "coordinates": [77.5946, 12.9716] },
  "isActive": true
}


## GET-------get all branch

GET--------http://localhost:5000/api/branches


## update branch
PUT----------http://localhost:5000/api/branches/68b56cbd4071c4277f97522f
68b56cbd4071c4277f97522f--branch id
{
    "name":"Central Indore Branch"
}


## delete branch
delete-----http://localhost:5000/api/branches/68b56cbd4071c4277f975222
68b56cbd4071c4277f975222---branch id

---------------------------------------------------
## MAP


## zeolocation
post---------http://localhost:5000/delivery-zones
{
  "branchId": "68b56cbd4071c4277f97522f",
  "name": "Distance Bands Zone",
  "pricing": {
    "type": "bands",
    "baseFee": 30,
    "bands": [
      { "fromKm": 0, "toKm": 3, "fee": 20 },
      { "fromKm": 3, "toKm": 7, "fee": 50 },
      { "fromKm": 7, "toKm": 15, "fee": 100 }
    ]
  },
  "minOrderValue": 150,
  "etaMinutes": 50
}


## get all zone
GET------http://localhost:5000/delivery-zones


## update
PUT---http://localhost:5000/delivery-zones/68b57eabad48ac1a20821f16
68b57eabad48ac1a20821f16-------id
{
  "name": "Zone A Updated",
  "pricing": {
    "baseFee":60
  }
}

## delete
DELETE--------http://localhost:5000/delivery-zones/68b57eabad48ac1a20821f45
68b57eabad48ac1a20821f45------id


-----------------------------------------------------



## order
post------http://localhost:5000/api/orders

cod
{
  "branch": "68b56cbd4071c4277f97522f",
  "items": [
    {
      "productId": "68b67cd41b398258eadea289",
      "qty": 2
    },
    {
      "productId": "68b56c404071c4277f975229",
      "qty": 1
    }
  ],
  "customer": {
    "name": "Arpita",
    "phone": 1111111111,
    "address": "Vijay Nagar, Indore",
    "location": {
      "type": "Point",
      "coordinates": [75.8577, 22.7196]
    }
  },
  "payment": {
    "method": "cod",
    "paid": false
  }
}


## online payment
{
  "branch": "68b56cbd4071c4277f97522f",
  "items": [
    {
      "productId": "68b67cd41b398258eadea289",
      "qty": 2
    },
    {
      "productId": "68b56c404071c4277f975229",
      "qty": 1
    }
  ],
  "customer": {
    "name": "Arpita",
    "phone": 1111111111,
    "address": "Vijay Nagar, Indore",
    "location": {
      "type": "Point",
      "coordinates": [75.8577, 22.7196]
    }
  },
  "payment": {
    "method": "online",
    "status": "paid",
    "transactionId": "TXN12345678"
  }
}


## assign order
PUT---------http://localhost:5000/api/orders/68b69461b1de00995a513bb8/assign

order/:id
68b69461b1de00995a513bb8------id----orderID

raw ---json send delivery boy id
{
  "delivery_boy": 6
}

## track order
GET---------------http://localhost:5000/api/orders/68b69461b1de00995a513bb8/trackOrder

68b69461b1de00995a513bb8---------id--- order id

## update status
PUT-----------http://localhost:5000/api/orders/68b69461b1de00995a513bb8/status

68b69461b1de00995a513bb8---------id---order id 

send res.body
{
  "status": "out_for_delivery"
}


## confirm delivery
PUT-------http://localhost:5000/api/orders/68b69461b1de00995a513bb8/confirm

68b69461b1de00995a513bb8---order id


## for ADMIN

## out for delivery
GET----http://localhost:5000/api/orders/out-for-delivery


## fetch new added order
GET-------------http://localhost:5000/api/orders/new

##  fetch delivered ordered 
GET-----http://localhost:5000/api/orders/delivered


## delivered missing product

GET----http://localhost:5000/api/orders/delivered-missing

## cancel order
GET------------http://localhost:5000/api/orders/cancel-order

## under porcess
GET----------------http://localhost:5000/api/orders/under-process

## pendig confirm
GET-------------http://localhost:5000/api/orders/pending-confirm

-----------------------------------------------------------------------------------
## REPORT

## report get report 
in get request 
sent data in params
branchId
startDate
endDate
GET----------http://localhost:5000/api/reports/sales?branchId=68b56cbd4071c4277f97522f&startDate=2025-08-01&endDate=2025-09-30

give you data
[
    {
        "totalSales": 13297,
        "products": [
            {
                "name": "Levis Jeans",
                "code": "LV-CL-005",
                "qty": 2,
                "sales": 11998
            },
            {
                "name": "T-Shirt Classic",
                "code": "TS-CL-001",
                "qty": 1,
                "sales": 1299
            }
        ],
        "branch": "Indore Branch"
    }
]



## low stock alert 
GET-------http://localhost:5000/api/reports/low-stock?threshold=10
get request

response
{
    "count": 1,
    "lowStock": [
        {
            "_id": "68b5733aab6bc40e3f408257",
            "branchId": {
                "_id": "68b56cbd4071c4277f97522f",
                "name": "Indore Branch"
            },
            "productId": {
                "_id": "68b56c404071c4277f975229",
                "name": "T-Shirt Classic"
            },
            "__v": 0,
            "createdAt": "2025-09-01T10:19:38.580Z",
            "lowStockThreshold": 10,
            "price": 1299,
            "quantity": 8,
            "updatedAt": "2025-09-02T05:18:15.413Z"
        }
    ]
}



## export sales report 
http://localhost:5000/api/reports/sales/export


-----------------------------------------------------------
## ai search
uvicorn search_service:app --reload --host 0.0.0.0 --port 8001

post-----http://localhost:8001/search

{
  q:"mobile"
}