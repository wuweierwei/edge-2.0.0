/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";var spawn=require("child_process").spawn,fs=require("fs"),path=require("path"),Readable=require("stream").Readable,util=require("util"),zlib=require("zlib"),cssRule=require("./cssRule"),config=require("../config"),charset=config.charset||"utf8",jar;util.inherits(Reader,Readable);function Reader(a){Readable.call(this,a)}Reader.prototype._read=function(){};Reader.prototype.writeFile=function(a,b){this.push(null);b?this.pipe(zlib.createGzip()).pipe(fs.createWriteStream(a+".gz")):this.pipe(fs.createWriteStream(a))};fs.readdirSync(__dirname).some(function(a){if(path.extname(a)===".jar"){jar=path.join(__dirname,a);return true}});function compress(a,c,j){var g=["-jar",jar,"--charset",charset,"--type",j],i,k,f=new Reader(),e,h,d;function b(l){if(l){e=new Reader();i.stdout.on("data",function(m){f.push(m);e.push(m)});i.stdout.on("end",function(){f.writeFile(c,false);e.writeFile(c,true)})}else{i.stdout.on("data",function(m){f.push(m)});i.stdout.on("end",function(){f.writeFile(c,false)})}}i=spawn("java",g);i.stderr.on("data",function(l){console.log(l.toString())});i.on("end",function(){i.exit()});i.on("exit",function(){console.log("\x1b[32m Success\x1b[0m :",a,"->",c)});k=fs.createReadStream(a);if(j==="css"){b(config.cssGzip);d="";k.on("data",function(l){d+=l});k.on("end",function(){var l=[];d=cssRule.keyframes.out(d,l);cssRule.rules.forEach(function(m){d=d.replace(m.reg,m.fn)});d=cssRule.keyframes.put(d,l);l=null;i.stdin.write(d);i.stdin.end()})}else{b(config.jsGzip);k.on("end",function(){i.stdin.end()});k.pipe(i.stdin)}}module.exports=compress;
