function readStdString (str) {
  const isTiny = (str.readU8() & 1) === 0;
  if (isTiny) {
    return str.add(1).readUtf8String();
  }

  return str.add(2 * Process.pointerSize).readPointer().readUtf8String();
}

var mod_art = Process.findModuleByName("libart.so");
if (mod_art) {
	var exports = mod_art.enumerateExports()
    for (var i = 0; i < exports.length; i++) {
		var exp = exports[i];
        if (exp.name.indexOf("LoadNativeLibrary") != -1) {
            console.log(exp.name, exp.address);

            Interceptor.attach(exp.address, {
                onEnter: function (args) {
                    this.pathName = readStdString(args[2]);
                    console.log("[*] [LoadNativeLibrary] in  pathName =", this.pathName);
                },
                onLeave: function (retval) {
                    console.log("[*] [LoadNativeLibrary] out pathName =", this.pathName);
                }
            });

            break;
        }
    }
}

var mod_dvm = Process.findModuleByName("libdvm.so");
if (mod_dvm) {
	var exports = mod_art.enumerateExports()
    for (var i = 0; i < exports.length; i++) {
		var exp = exports[i];
        if (exp.name.indexOf("dvmLoadNativeCode") != -1) {
            console.log(exp.name, exp.address);
            //    bool dvmLoadNativeCode(const char * pathName, void * classLoader, char ** detail);

            Interceptor.attach(exp.address, {
                onEnter: function (args) {
                    this.pathName = args[0].readUtf8String();
                    console.log("[*] [dvmLoadNativeCode] in  pathName =", this.pathName);
                },
                onLeave: function (retval) {
                    console.log("[*] [dvmLoadNativeCode] out pathName =", this.pathName);
                }
            });
            break;
        }
    }
}
