export const flattenArr = (arr)=>{
    return arr.reduce((map, item)=>{
        map[item.id] = item
        return map
    },{})
}

export const objToArr = (obj)=>{
    return Object.keys(obj).map(key => obj[key])
}

export const getParentNode = (node, className)=>{
    let current = node
    while (current!==null){
        if(current.classList.contains(className)){
            return current
        }else{
            current = current.parentNode
        }
    }
    return false
}