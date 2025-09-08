import { useState } from "react";
import AddStoreForm from "./AddStoreForm";

export default function BranchDetail({ branch, onBack }) {
  const [addingStore, setAddingStore] = useState(false);

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={onBack}>⬅ Back</button>
      <h3>{branch.branchName}</h3>
      <p>Code: {branch.code}</p>
      <p>Address: {branch.address}</p>

      <hr />
      <div className="d-flex justify-content-between align-items-center">
        <h4>Stores</h4>
        <button className="btn btn-success" onClick={() => setAddingStore(!addingStore)}>
          {addingStore ? "Cancel" : "Add Store"}
        </button>
      </div>

      {addingStore && <AddStoreForm branchId={branch._id} />}

      <ul className="list-group mt-3">
        {branch.stores?.map(store => (
          <li key={store._id} className="list-group-item">
            <h5>{store.name} {store.isOpen ? "(Open)" : "(Closed)"}</h5>
            <p>Open: {store.openTime} - Close: {store.closeTime}</p>

            <h6>Zones</h6>
            <ul>
              {store.zones?.map(zone => (
                <li key={zone._id}>
                  {zone.name} | Min: {zone.minOrderValue} | Free Above: {zone.freeDeliveryAbove} | Delivery Time: {zone.deliveryTime}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
