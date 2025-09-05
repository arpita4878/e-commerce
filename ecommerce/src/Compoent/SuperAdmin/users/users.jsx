import { useState, useEffect } from "react";
import { __userapiurl, __orderapiurl } from "../../../../API_URL";

export default function UsersWithOrders() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(__userapiurl + "getdata");
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch all orders for a single user
  const fetchUserOrders = async (user) => {
    setLoading(true);
    setSelectedUser(user);
    try {
      const res = await fetch(`${__orderapiurl}user/${user._id}`);
      const data = await res.json();
      setUserOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      // show modal
      const modal = new window.bootstrap.Modal(
        document.getElementById("ordersModal")
      );
      modal.show();
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👥 Users & Orders</h2>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Designation</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Birthdate</th>
              <th>Registered</th>
              <th>Points</th>
              <th>Orders</th>
              <th>Total Amount</th>
              <th>Last Order</th>
              <th>Nationality</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id}>
                  <td>{u.designation || "-"}</td>
                  <td>{u.name}</td>
                  <td>{u.surname || "-"}</td>
                  <td>{u.email || "-"}</td>
                  <td>{u.phone}</td>
                  <td>{u.birthdate ? new Date(u.birthdate).toLocaleDateString() : "-"}</td>
                  <td>{new Date(u.registeredDate).toLocaleDateString()}</td>
                  <td>{u.points}</td>
                  <td>{u.orderCount}</td>
                  <td>₹{u.totalOrderAmount}</td>
                  <td>
                    {u.lastOrderDate
                      ? new Date(u.lastOrderDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{u.nationality || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => fetchUserOrders(u)}
                    >
                      View Orders
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orders Modal */}
      <div
        className="modal fade"
        id="ordersModal"
        tabIndex="-1"
        aria-labelledby="ordersModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title" id="ordersModalLabel">
                Orders for {selectedUser?.name}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <p>Loading orders...</p>
              ) : userOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order._id}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>₹{order.total}</td>
                          <td>
                            <span className="badge bg-info">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No orders found .</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
