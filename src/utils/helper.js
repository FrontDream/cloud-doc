export const flattenArr = (arr)=>{
    return arr.reduce((map, item)=>{
        map[item.id] = item
        return map
    },{})
}

export const objToArr = (obj)=>{
    return Object.keys(obj).map(key => obj[key])
}

/**
 * 根据当前节点，找到拥有className的父节点
 * @param node
 * @param className
 * @returns {(() => (Node | null))|ActiveX.IXMLDOMNode|(Node & ParentNode)|boolean}
 */
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

export  const timestampToString = (timestamps)=>{
    const date = new Date(timestamps)
    return date.toLocaleDateString()+" "+ date.toLocaleTimeString()
}