const branch = require("../schema/Branch.model");
const apierror = require("../utility/apierror");

const createbranch = async (payload) => {
  if (payload.isMainBranch) {
    await branch.updateMany({}, { $set: { isMainBranch: false } });
  }

  const newbranch = await branch.create(payload);
  return newbranch;
};

const getallbranch = async () => {
  const branches = await branch.find({ isActive: true }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  return branches;
};

const getbranchbyid = async (id) => {
  const newbranch = await branch.findById(id);

  if (!newbranch) {
    throw new apierror(404, "Branch not found");
  }
  return newbranch;
};

const getmainbranch = async () => {
  let newbranch = await branch.findOne({
    isMainBranch: true,
    isActive: true,
  });

  if (!newbranch) {
    newbranch = await branch.findOne({ isActive: true }).sort({
      sortOrder: 1,
      createdAt: -1,
    });
  }
  return newbranch;
};

const updatebranch = async (id, payload) => {
  const existbranch = await branch.findById(id);

  if (!existbranch) {
    throw new apierror(404, "Branch not found");
  }

  if (payload.isMainBranch) {
    await branch.updateMany(
      { _id: { $ne: id } },
      { $set: { isMainBranch: false } },
    );
  }

  const updatebranch = await branch.findByIdAndUpdate(
    id,
    { $set: payload },
    {
      new: true,
      runValidators: true,
    },
  );
  return updatebranch;
};


const deletebranch = async(id)=>{
    const existbranch = await branch.findById(id);

    if(!existbranch){
        throw new apierror(404 , "branch not found");
    }

    existbranch.isActive = false;
    await existbranch.save();

    return existbranch;
}

module.exports = {
    createbranch,
    getallbranch,
    getbranchbyid,
    getmainbranch,
    updatebranch,
    deletebranch
}
