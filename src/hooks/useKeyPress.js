import { useState, useEffect } from "react";

/**
 * 传入键盘码，返回当前按下的是否是传入的码所对应的键
 * @param targetKeyCode
 * @returns {boolean}
 */
const useKeyPress = (targetKeyCode)=>{
    const [keyPress,setKeyPress]= useState(false)
    const keyDownHandler = ({keyCode})=>{
        if(keyCode===targetKeyCode){
            setKeyPress(true)
        }
    }
    const keyUpHandler = ({keyCode}) =>{
        if(keyCode===targetKeyCode){
            setKeyPress(false)
        }
    }
    useEffect(()=>{
        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        return ()=>{
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)
        }
    },[])
    return keyPress
}

export default useKeyPress