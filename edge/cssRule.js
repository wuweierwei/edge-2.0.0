/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";
const _WEBKIT_="-webkit-",
      _MOZ_   ="-moz-",
      _O_     ="-o-";

const transformReg=regCompile(/\btransform(?:-[^:]+?)*:[^;\}]+?(?=;|\})/mg);

var css={};

  //规则
  css.rules=[
  {
    reg:regCompile(/\btransition(?:-[^:]+?)*:[^;\}]+?(?=;|\})/mg),  //transition
    fn:_transition
  },
  {
    reg:regCompile(/\b(animation(?:-[^:]+?)*:)([^;\}]+?)(?=;|\})/mg),  //animation
    fn:_animation
  },
  {
      reg:transformReg,                         //transform
      fn:_usually
  },
  {
    reg:regCompile(/\b(background(?:-image)*\s*:)\s*(linear-gradient\s*\([\s\S]*?)(?=;|\})/mg),  //linear-gradient
    fn:_gradient
  },
  {
    reg:regCompile(/\b(background(?:-image)*\s*:)\s*(radial-gradient\s*\([\s\S]*?)(?=;|\})/mg),  //radial-gradient
    fn:_gradient
  },
  {
      reg:regCompile(/\buser-select\s*:[^;\}]+?(?=;|\})/mg),      //user-select
      fn:_usually
  },
  /* flex start */
  {
      reg:regCompile(/\bdisplay\s*:\s*flex\b/mg),
      fn:function(){
          return `display: -webkit-box;
                  display: -webkit-flex;
                  display: -moz-flex;
                  display: -ms-flexbox;
                  display: flex`;
      }
  },
  {
      reg:regCompile(/\bdisplay\s*:\s*inline-flex\b/mg),
      fn:function(){
          return `display: -webkit-inline-box;
                  display: -webkit-inline-flex;
                  display: -moz-inline-flex;
                  display: -ms-inline-flexbox;
                  display: inline-flex`;
      }
  },
  {
      reg:regCompile(/\bflex-direction\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {
        var oldStandard,
            standard=`
             -webkit-flex-direction: ${value};
             -moz-flex-direction: ${value};
             -ms-flex-direction: ${value};
             flex-direction: ${value}`;
        
        switch(value)
        {
            case "row-reverse":
              oldStandard="-webkit-box-direction: reverse;-webkit-box-orient: horizontal;";
            break;
            case "column":
              oldStandard="-webkit-box-direction: normal;-webkit-box-orient: vertical;";
            break;
            case "column-reverse":
              oldStandard="-webkit-box-direction: reverse;-webkit-box-orient: vertical;";
            break;
            default:
              oldStandard="-webkit-box-direction: normal;-webkit-box-orient: horizontal;";
        }
       
       return oldStandard+standard;  
      }
    },
   {
      reg:regCompile(/\bflex-wrap\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {        
        // No Webkit Box fallback.
        return `-webkit-flex-wrap:${value};
        -moz-flex-wrap: ${value};
        -ms-flex-wrap:${value === "nowrap"?"none":value}; 
        flex-wrap: ${value}`;      
     }
   },
   {
      reg:regCompile(/\bflex-wrap\s*:\s*([\sa-z-]+?)\b/mg),
      fn:function(a,value) {        
        // No Webkit Box fallback.
        return `-webkit-flex-flow: ${values};
        -moz-flex-flow: ${values};
        -ms-flex-flow: ${values};
        flex-flow: ${values}`; 
      }
    },
    {
      reg:regCompile(/\border\s*:\s*(\d+?)\b/mg),
      fn:function(a,value) {
        value=parseInt(value,10)||0;
        return `-webkit-box-ordinal-group: ${value + 1};
        -webkit-order: ${value};
        -moz-order: ${value};
        -ms-flex-order: ${value};
        order: ${value}`;
      }
    },
    {
      reg:regCompile(/\bflex-grow\s*:\s*(\d+?)\b/mg),
      fn:function(a,value) {
        value=parseInt(value,10)||0;
        return `-webkit-box-flex: ${value};
            -webkit-flex-grow: ${value};
            -moz-flex-grow: ${value};
            -ms-flex-positive: ${value};
            flex-grow: ${value}`;
      }
    },
    {
      reg:regCompile(/\bflex-shrink\s*:\s*(\d+?)\b/mg),
      fn:function(a,value) {
        value=parseInt(value,10)||1;
        return `-webkit-flex-shrink: ${value};
            -moz-flex-shrink: ${value};
            -ms-flex-negative: ${value};
            flex-shrink: ${value}`;
      }
    },
    {
      reg:regCompile(/\bflex-basis\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {
        return `-webkit-flex-basis: ${value};
            -moz-flex-basis: ${value};
            -ms-flex-preferred-size: ${value};
            flex-basis: ${value}`;
      }
    },
    {
      reg:regCompile(/\bflex\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,v) {
         var  s=v.trim().split(" ");          
        return ` -webkit-box-flex: ${v[0]}; // Webkit Old
          -moz-box-flex:${v[0]}; // Mozilla Old
          -webkit-flex:${v}; // Webkit Standard
          -moz-flex: ${v}; // Mozilla Standard
          -ms-flex: ${v}; // IE 10 Mid, IE 11 Standard
          ${a}`; // Standard
      }
    },
    {
      reg:regCompile(/\bjustify-content\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {
          var out;
          switch(value)
          {
              case "flex-start":
               out="-webkit-box-pack: start;-ms-flex-pack: start;";
              break;
              case "flex-end":
                out="-webkit-box-pack: end;-ms-flex-pack: end;";
              break;
              case "space-between":
                out="webkit-box-pack: justify;-ms-flex-pack: justify;";
              break;
              case "space-around":
                out="-ms-flex-pack: distribute;";	
              break;
              default:
                out=`-webkit-box-pack: ${value};
                   -ms-flex-pack: ${value};`;
            }

            out+=`-webkit-justify-content: ${value};
                 -moz-justify-content: ${value};
                 justify-content: ${value}`;
            
            return out;
      }
    },
    {
      reg:regCompile(/\balign-items\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {
          var out;
          switch(value)
          {
              case "flex-start":
                out="-webkit-box-align: start;-ms-flex-align: start;";
              break;
              case "flex-end":
                out="-webkit-box-align: end;-ms-flex-align: end;";
              break;
              default:
                out=`-webkit-box-align: ${value};
                   -ms-flex-align: ${value};`;
           }

           out+=`-webkit-align-items: ${value};
                -moz-align-items: ${value};
                ${a}`;
          
          return out;
      }
    },
    {
      reg:regCompile(/\balign-self\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {
          // No Webkit Box Fallback.
         return `-webkit-align-self: ${value};
            -moz-align-self: ${value};            
            -ms-flex-item-align:${value === "flex-start"?"start":(value==="flex-end"?"end":value)};
            ${a}`;
      }
    },
    {
      reg:regCompile(/\balign-content\s*:\s*([^;\}]+?)(?=;|\})/mg),
      fn:function(a,value) {
         // No Webkit Box Fallback.
        return `-webkit-align-content: ${value};
            -moz-align-content: ${value};     
            -ms-flex-line-pack:${value==="flex-start"?"start":(value==="flex-end"?"end":value)};
            ${a}`;
      }
    }
  /* flex end  */
];

//通用的，直接在前面加前缀
function _usually(a){
  var out=`${_WEBKIT_}${a};
    ${_MOZ_}${a};
    ${_O_}${a};
    ${a}`;
  
  return out;
}

//处理css transition:transform 1s;
function _transition(transition){
   var reg=/\btransform\b/,left,right,out;
   
   if(reg.exec(transition))
   {
        left=RegExp["$`"];
        right=RegExp["$'"];

       out=`${_WEBKIT_}${left}${_WEBKIT_}transform${right};
           ${_MOZ_}${left}${_MOZ_}transform${right};
           ${_O_}${left}${_O_}transform${right};
           ${transition}`;
   }
   else
   {
       out=`${_WEBKIT_}${transition};
            ${_MOZ_}${transition};
            ${_O_}${transition};
            ${transition}`;
       
   }
    return out;
}

//处理animation
function _animation(animation,left,keyframes_name){
     var out=`${_WEBKIT_}${left}${_WEBKIT_}${keyframes_name};
            ${_MOZ_}${left}${_MOZ_}${keyframes_name};
            ${_O_}${left}${_O_}${keyframes_name};
            ${animation}`;

    return out;
}

//处理背景渐变
function _gradient(a,b,c){
     var out=`${b}${_WEBKIT_}${c};
                 ${b}${_MOZ_}${c};
                 ${b}${_O_}${c};
                 ${a}`;
       return out;
}

//处理 @keyframes
css.keyframes={
    reg:regCompile(/@keyframes\s+[^{]+?\{(?:\{[^}]*?\}|[^}])*\}/mg),
    reg1:regCompile(/\$\{keyframes__(\d+)\}/mg),
    _dispose:function(a){
      var out=[],a1=a.substr(1);
      out.push(this._tmpl(_WEBKIT_,a1));
      out.push(this._tmpl(_MOZ_,a1));
      out.push(this._tmpl(_O_,a1));
      out.push(a);
      return out.join("");
    },
    _tmpl:function(prefix,a1){
        a1=a1.replace(transformReg,function(a){
            return prefix+a;
        });
       return `@${prefix}${a1}`;
    },
    out:function(txt,arr){
       var that=this;
       return txt.replace(that.reg,function(a){
           var idx=arr.length;
            arr.push(that._dispose(a));

           return "${keyframes__"+idx+"}";
       });
    },
    put:function(txt,arr){
       return txt.replace(this.reg1,function(a,idx){
            return arr[idx];
        });
    }
};

//正则处理
function regCompile(reg){
  reg.compile(reg);
  return reg;
}

module.exports=css;