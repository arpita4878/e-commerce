import Branch from "..//model/branch.schema.js"

export async function createBranch(req, res, next) {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ branch });
  } catch (err) { next(err); }
}

export async function listBranches(_req, res, next) {
  try {
    const branches = await Branch.find().lean();
    res.json({ branches });
  } catch (err) { next(err); }
}


export async function updateBranch(req, res, next) {
  try {
    const { id } = req.params;

    const branch = await Branch.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({ message: "Branch updated successfully", branch });
  } catch (err) {
    next(err);
  }
}


export async function deleteBranch(req, res, next) {
  try {
    const { id } = req.params;

    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({ message: "Branch deleted successfully" });
  } catch (err) {
    next(err);
  }
}