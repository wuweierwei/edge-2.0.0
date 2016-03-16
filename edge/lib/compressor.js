/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";var spawn=require("child_process").spawn,fs=require("fs"),path=require("path"),cssRule=require(__dirname+"/cssRule"),jar;fs.readdirSync(__dirname).some(function(a){if(path.extname(a)===".jar"){jar=path.join(__dirname,a);return true}});function compress(g,c,h,d){var b=["-jar",jar,"--charset",h,"--type",d,"-o",c],e,a;if(d==="css"){var f=[];a=fs.readFileSync(g,h);e=spawn("java",b);a=cssRule.keyframes.out(a,f);cssRule.rules.forEach(function(i){a=a.replace(i.reg,i.fn)});a=cssRule.keyframes.put(a,f);f=null;e.stdin.write(a)}else{b.push(g);e=spawn("java",b)}e.stdout.on("data",function(i){e.stdin.write(i)});e.stderr.on("data",function(i){console.log("process stderr:",i)});e.on("end",function(){e.exit()});e.on("exit",function(){console.log("\x1b[32m Success\x1b[0m :",g,"->",c)});e.stdin.end()}module.exports=compress;