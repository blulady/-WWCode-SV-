export const formatDate = (dateStr) => {
    if (!dateStr) {
      return "";
    }
    let d = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return d.toLocaleDateString("en-US", options);
};

export const getPageId = (path) => {
  return path.substring(1).split("/")[0];
};

export const getTabId = (path) => {
  return path.substring(1).split("/").pop();
};
