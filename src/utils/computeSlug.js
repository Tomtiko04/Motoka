export const computeSlug=(title)=>{
    return title.trim().replace(/\s+/g, "-");
};