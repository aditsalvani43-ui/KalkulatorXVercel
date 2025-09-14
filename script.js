// script.js - core kalkulator logic
// uses window.kalk helpers from index.js

// internal state
let buffer = "";    // string expression shown to user (menggunakan comma untuk desimal)
let memory = "";    // history / angka terakhir

// format display safely
function updateDisplay(){
  const d = buffer === "" ? "0" : buffer;
  window.kalk.setDisplay(d);
  window.kalk.setMemory(memory);
}

// sanitize input: accept digits, ',', operators × ÷ + - and percent handled separately
function appendToBuffer(token){
  // handle double comma
  if(token === "," && buffer.slice(-1) === ",") return;
  // prevent leading multiple zeros like "000" except when decimal
  if(/^[0]+$/.test(buffer) && token === "0") return;
  buffer += token;
  updateDisplay();
}

// convert visible expression to JS-evaluable expression
function toJsExpression(expr){
  // replace × ÷ with * and /
  let s = expr.replace(/×/g, "*").replace(/÷/g, "/");
  // convert comma decimal to dot: but only inside numbers (replace last comma between digits)
  // replace ',' with '.' (user sees comma but eval needs dot)
  s = s.replace(/,/g, ".");
  return s;
}

// evaluate expression safely
function evaluateExpression(expr){
  const s = toJsExpression(expr);
  try{
    // block suspicious tokens (letters etc)
    if(/[a-zA-Z]/.test(s)) throw new Error('Invalid characters');
    // Use Function instead of eval
    const result = Function('"use strict";return (' + s + ')')();
    // round result to sensible digits
    if (!isFinite(result)) throw new Error('Math error');
    const rounded = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    // convert dot back to comma for display if necessary
    return String(rounded).replace(/\./, ",");
  }catch(err){
    return "Err";
  }
}

// actions (connected from index.js)
function handleInput(val){
  // value may be '00' or ',' or digit or operator
  if(val === "00"){
    // don't allow leading '00' multiple: if buffer empty, add '0' only once
    if(buffer === "") buffer = "0";
    else buffer += "00";
    updateDisplay();
    return;
  }
  // operators: + - × ÷
  if(["+","-","×","÷"].includes(val)){
    // avoid two operators in a row
    if(buffer === "" && val !== "-") return; // allow negative start
    // replace last operator if last char operator
    if(/[+\-×÷]$/.test(buffer)) {
      buffer = buffer.slice(0,-1) + val;
    } else {
      buffer += val;
    }
    updateDisplay();
    return;
  }
  // comma (decimal)
  if(val === ","){
    // only allow comma inside a number and only once per number segment
    // find last operator index
    const lastOp = buffer.search(/[+\-×÷][^+\-×÷]*$/);
    const lastSegment = lastOp === -1 ? buffer : buffer.slice(lastOp+1);
    if(lastSegment.includes(",")) return;
    if(lastSegment === "") buffer += "0,";
    else buffer += ",";
    updateDisplay();
    return;
  }
  // digit
  if(/[0-9]/.test(val)){
    // if buffer is "0" and next digit, replace leading zero
    if(buffer === "0") buffer = val;
    else buffer += val;
    updateDisplay();
    return;
  }
}

// handle functional buttons
function handleAction(action){
  if(action === "clear"){
    buffer = "";
    memory = "";
    updateDisplay();
    return;
  }
  if(action === "back"){
    if(buffer.length > 0) buffer = buffer.slice(0, -1);
    updateDisplay();
    return;
  }
  if(action === "percent"){
    // apply percent to the last number segment (e.g., 200+10% -> 200+0.1)
    // find last operator
    const match = buffer.match(/([+\-×÷])?([0-9,]+)$/);
    if(!match) return;
    const numStr = match[2].replace(/,/g, ".");
    const num = parseFloat(numStr);
    if(isNaN(num)) return;
    const pct = num / 100;
    // replace last number with pct (use comma for display)
    buffer = buffer.slice(0, match.index) + String(pct).replace(/\./, ",");
    updateDisplay();
    return;
  }
  if(action === "equals"){
    if(buffer === "") return;
    const result = evaluateExpression(buffer);
    // store memory and show result
    memory = buffer + " =";
    buffer = result;
    updateDisplay();
    return;
  }
}

// expose helpers to index.js (so index.js can call them)
window.handleInput = handleInput;
window.handleAction = handleAction;

// initialize
document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
});
