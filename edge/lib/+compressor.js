/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";
var spawn=require("child_process").spawn,
    fs=require("fs"),
    path=require("path"),
    Readable=require("stream").Readable,
    util=require("util"),
    zlib=require("zlib"),
    cssRule=require("./cssRule"),
    config=require("../config"),    
    charset=config.charset||"utf8",
    jar;

util.inherits(Reader, Readable);

function Reader(opt) {
  Readable.call(this,opt);
}

Reader.prototype._read = function(){};
Reader.prototype.writeFile = function(out,isGzipFile){
  this.push(null);
  isGzipFile?
     this.pipe(zlib.createGzip()).pipe(fs.createWriteStream(out+".gz")):
     this.pipe(fs.createWriteStream(out));
};

fs.readdirSync(__dirname).some(function(file){
   if(path.extname(file)===".jar"){
     jar=path.join(__dirname,file);
     return true;
   }
});

function compress(src,out,type){
  
   var args=["-jar",jar,"--charset",charset,"--type",type/*,"-o",out*/],cp,stm,
       outReader=new Reader(),
       gReader,
       gzipReader,
       txt;

    function dataListen(isGzip){
       if(isGzip)
       {
         gReader=new Reader();
         cp.stdout.on('data',function(buffer){
           outReader.push(buffer);
           gReader.push(buffer);
         });

         cp.stdout.on("end",function(){
            outReader.writeFile(out,false);
            gReader.writeFile(out,true);
         });
       }
       else
       {
          cp.stdout.on('data',function(buffer){
            outReader.push(buffer);
          });
          cp.stdout.on("end",function(){
            outReader.writeFile(out,false);
         });
       }
    }

    cp=spawn("java",args);

    cp.stderr.on('data',function(data){
      console.log(data.toString());
    });

    cp.on("end",function(){       
       cp.exit();
    });
    cp.on("exit",function(){
      console.log("\x1b[32m Success\x1b[0m :",src,"->",out);
    });
    
    stm=fs.createReadStream(src);

    if(type==="css")
    {         
       dataListen(config.cssGzip);

       txt="";

       stm.on("data",function(buf){
         txt+=buf;
       });
       stm.on("end",function(){
           var keyframes=[];
           txt=cssRule.keyframes.out(txt,keyframes); //先把@keyframes给提出来
           
           cssRule.rules.forEach(function(rule){
             txt=txt.replace(rule.reg,rule.fn);
           });
           
           txt=cssRule.keyframes.put(txt,keyframes); //先把@keyframes填进去
           
           keyframes=null;

           cp.stdin.write(txt);

           cp.stdin.end();
       }); 
    }
    else
    {
      dataListen(config.jsGzip);
      
      stm.on("end",function(){
        cp.stdin.end();
      });

      stm.pipe(cp.stdin);
    }
}

module.exports=compress;
