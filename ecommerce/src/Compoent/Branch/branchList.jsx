import { useEffect, useState } from "react";
import axios from "axios";
// import BranchDetail from "./BranchDetail";
// import AddBranchForm from "./AddBranchForm";

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [addingBranch, setAddingBranch] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/branch");
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  if (selectedBranch) {
    return <BranchDetail branch={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Branches</h2>
        <button className="btn btn-success" onClick={() => setAddingBranch(!addingBranch)}>
          {addingBranch ? "Cancel" : "Add Branch"}
        </button>
      </div>

      {addingBranch && <AddBranchForm onAdded={fetchBranches} />}

      <ul className="list-group">
        {branches.map(branch => (
          <li
            key={branch._id}
            className="list-group-item d-flex justify-content-between align-items-center"
            onClick={() => setSelectedBranch(branch)}
            style={{ cursor: "pointer" }}
          >
            {branch.branchName}
            <span className="badge bg-primary">{branch.stores?.length || 0} stores</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
