
export function branchScope(req, res, next) {
  if (req.user.role === "branch_admin") {
    // force branch_admin to only manage their own branch
    req.branchId = req.user.branch;
  } else if (req.user.role === "super_admin") {
    // super_admin can manage all branches
    req.branchId = req.body.branchId || req.params.branchId;
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}
