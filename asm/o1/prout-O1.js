// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= (+(1)) ? (tempDouble > (+(0)) ? ((Math.min((+(Math.floor((tempDouble)/(+(4294967296))))), (+(4294967295))))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+(4294967296)))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 1073741824;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 525576;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _abort() {
      Module['abort']();
    }
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,EDOTDOT:76,EBADMSG:77,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  Module["_strlen"] = _strlen;
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can   access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"Connection reset by network",127:"Socket is already connected",128:"Socket is not connected",129:"Too many references",131:"Too many users",132:"Quota exceeded",133:"Stale file handle",134:"Not supported",135:"No medium (in tape drive)",138:"Illegal byte sequence",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var VFS=undefined;
  var TTY={ttys:[],register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          // this wouldn't be required if the library wasn't eval'd at first...
          if (!TTY.utf8) {
            TTY.utf8 = new Runtime.UTF8Processor();
          }
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              if (process.stdin.destroyed) {
                return undefined;
              }
              result = process.stdin.read();
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          if (node.contentMode === MEMFS.CONTENT_OWNING) {
            assert(contents.byteOffset);
            Module['_free'](contents.byteOffset);
          }
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 0x02) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,nodes:[null],devices:[null],streams:[null],nextInode:1,name_table:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.name_table.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.name_table[hash];
        FS.name_table[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.name_table[hash] === node) {
          FS.name_table[hash] = node.name_next;
        } else {
          var current = FS.name_table[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.name_table[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayMknod:function (mode) {
        switch (mode & 0170000) {
          case 0100000:
          case 0020000:
          case 0060000:
          case 0010000:
          case 0140000:
            return 0;
          default:
            return ERRNO_CODES.EINVAL;
        }
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 3) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 3) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 8); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current, 0777);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = input && output ? 0777 : (input ? 0333 : 0555);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = PATH.resolve(PATH.join(parent, name));
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp', 0777);
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev', 0777);
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', 0666, FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', 0666, FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', 0666, FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm', 0777);
        FS.mkdir('/dev/shm/tmp', 0777);
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.name_table = new Array(4096);
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode &= 4095;
        mode |= 0100000;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode &= 511 | 0001000;
        mode |= 0040000;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        mode |= 0020000;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;
  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_ii=env.invoke_ii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var invoke_vi=env.invoke_vi;
  var _sysconf=env._sysconf;
  var _sbrk=env._sbrk;
  var ___setErrNo=env.___setErrNo;
  var ___errno_location=env.___errno_location;
  var _abort=env._abort;
  var _time=env._time;
  var _fflush=env._fflush;
// EMSCRIPTEN_START_FUNCS
function stackAlloc(size){size=size|0;var ret=0;ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+7>>3<<3;return ret|0}function stackSave(){return STACKTOP|0}function stackRestore(top){top=top|0;STACKTOP=top}function setThrew(threw,value){threw=threw|0;value=value|0;if((__THREW__|0)==0){__THREW__=threw;threwValue=value}}function copyTempFloat(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0]}function copyTempDouble(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0];HEAP8[tempDoublePtr+4|0]=HEAP8[ptr+4|0];HEAP8[tempDoublePtr+5|0]=HEAP8[ptr+5|0];HEAP8[tempDoublePtr+6|0]=HEAP8[ptr+6|0];HEAP8[tempDoublePtr+7|0]=HEAP8[ptr+7|0]}function setTempRet0(value){value=value|0;tempRet0=value}function setTempRet1(value){value=value|0;tempRet1=value}function setTempRet2(value){value=value|0;tempRet2=value}function setTempRet3(value){value=value|0;tempRet3=value}function setTempRet4(value){value=value|0;tempRet4=value}function setTempRet5(value){value=value|0;tempRet5=value}function setTempRet6(value){value=value|0;tempRet6=value}function setTempRet7(value){value=value|0;tempRet7=value}function setTempRet8(value){value=value|0;tempRet8=value}function setTempRet9(value){value=value|0;tempRet9=value}function runPostSets(){}function _njSkip($count){$count=$count|0;var label=0;label=1;while(1)switch(label|0){case 1:HEAP32[19]=(HEAP32[19]|0)+$count;HEAP32[20]=(HEAP32[20]|0)-$count;HEAP32[21]=(HEAP32[21]|0)-$count;if((HEAP32[20]|0)<0){label=2;break}else{label=3;break};case 2:HEAP32[18]=5;label=3;break;case 3:return}}function _njInit(){_memset(72|0,0|0,525e3|0);return}function _njDone(){var $1=0,$5=0,$11=0,$15=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[39]|0;if(($1|0)==0){label=3;break}else{label=2;break};case 2:_free($1);label=3;break;case 3:$5=HEAP32[50]|0;if(($5|0)==0){label=7;break}else{label=6;break};case 4:_free($15);label=5;break;case 5:_njInit();return;case 6:_free($5);label=7;break;case 7:$11=HEAP32[61]|0;if(($11|0)==0){label=9;break}else{label=8;break};case 8:_free($11);label=9;break;case 9:$15=HEAP32[131267]|0;if(($15|0)==0){label=5;break}else{label=4;break}}}function _njDecode($jpeg,$size){$jpeg=$jpeg|0;$size=$size|0;var $1=0,$4=0,$15=0,$27=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:_njDone();HEAP32[19]=$jpeg;$1=$size&2147483647;HEAP32[20]=$1;if($1>>>0<2){$_0=1;label=17;break}else{label=2;break};case 2:$4=HEAP32[19]|0;if((HEAPU8[$4+1|0]^216|HEAPU8[$4]^255|0)==0){label=3;break}else{$_0=1;label=17;break};case 3:_njSkip(2);label=4;break;case 4:$15=HEAP32[18]|0;if(($15|0)==0){label=5;break}else if(($15|0)==6){label=16;break}else{$_0=$15;label=17;break};case 5:if((HEAP32[20]|0)<2){$_0=5;label=17;break}else{label=6;break};case 6:if((HEAP8[HEAP32[19]|0]|0)==-1){label=7;break}else{$_0=5;label=17;break};case 7:_njSkip(2);$27=HEAPU8[(HEAP32[19]|0)-1|0]|0;switch($27|0){case 192:{label=8;break};case 196:{label=9;break};case 219:{label=10;break};case 221:{label=11;break};case 218:{label=12;break};case 254:{label=13;break};default:{label=14;break}}break;case 8:_njDecodeSOF();label=4;break;case 9:_njDecodeDHT();label=4;break;case 10:_njDecodeDQT();label=4;break;case 11:_njDecodeDRI();label=4;break;case 12:_njDecodeScan();label=4;break;case 13:_njSkipMarker();label=4;break;case 14:if(($27&240|0)==224){label=15;break}else{$_0=2;label=17;break};case 15:_njSkipMarker();label=4;break;case 16:HEAP32[18]=0;_njConvert();$_0=HEAP32[18]|0;label=17;break;case 17:return $_0|0}return 0}function _njDecodeSOF(){var $5=0,$21=0,$c_068=0,$ssymax_067=0,$ssxmax_066=0,$i_065=0,$36=0,$37=0,$49=0,$50=0,$51=0,$63=0,$64=0,$73=0,$_ssxmax_0=0,$75=0,$ssymax_1=0,$77=0,$_pr=0,$ssxmax_2=0,$ssymax_2=0,$86=0,$91=0,$c_148=0,$i_147=0,$101=0,$105=0,$106=0,$109=0,$111=0,$116=0,$119=0,$136=0,$139=0,$144=0,$149=0,$151=0,$156=0,$159=0,label=0;label=1;while(1)switch(label|0){case 1:_njDecodeLength();if((HEAP32[21]|0)<9){label=2;break}else{label=3;break};case 2:HEAP32[18]=5;label=36;break;case 3:$5=HEAP32[19]|0;if((HEAP8[$5]|0)==8){label=5;break}else{label=4;break};case 4:HEAP32[18]=2;label=36;break;case 5:HEAP32[23]=(_njDecode16($5+1|0)|0)&65535;HEAP32[22]=(_njDecode16((HEAP32[19]|0)+3|0)|0)&65535;HEAP32[28]=HEAPU8[(HEAP32[19]|0)+5|0]|0;_njSkip(6);$21=HEAP32[28]|0;if(($21|0)==1|($21|0)==3){label=7;break}else{label=6;break};case 6:HEAP32[18]=2;label=36;break;case 7:if((HEAP32[21]|0)<($21*3|0|0)){label=8;break}else{$i_065=0;$ssxmax_066=0;$ssymax_067=0;$c_068=116;label=9;break};case 8:HEAP32[18]=5;label=36;break;case 9:HEAP32[$c_068>>2]=HEAPU8[HEAP32[19]|0]|0;$36=(HEAPU8[(HEAP32[19]|0)+1|0]|0)>>>4;$37=$c_068+4|0;HEAP32[$37>>2]=$36;if(($36|0)==0){label=10;break}else{label=11;break};case 10:HEAP32[18]=5;label=36;break;case 11:if(($36+15&$36|0)==0){label=13;break}else{label=12;break};case 12:HEAP32[18]=2;label=36;break;case 13:$49=HEAPU8[(HEAP32[19]|0)+1|0]|0;$50=$49&15;$51=$c_068+8|0;HEAP32[$51>>2]=$50;if(($50|0)==0){label=14;break}else{label=15;break};case 14:HEAP32[18]=5;label=36;break;case 15:if(($49+15&$50|0)==0){label=17;break}else{label=16;break};case 16:HEAP32[18]=2;label=36;break;case 17:$63=HEAPU8[(HEAP32[19]|0)+2|0]|0;$64=$c_068+24|0;HEAP32[$64>>2]=$63;if(($63&252|0)==0){label=19;break}else{label=18;break};case 18:HEAP32[18]=5;label=36;break;case 19:_njSkip(3);HEAP32[62]=HEAP32[62]|1<<HEAP32[$64>>2];$73=HEAP32[$37>>2]|0;$_ssxmax_0=($73|0)>($ssxmax_066|0)?$73:$ssxmax_066;$75=HEAP32[$51>>2]|0;$ssymax_1=($75|0)>($ssymax_067|0)?$75:$ssymax_067;$77=$i_065+1|0;$_pr=HEAP32[28]|0;if(($77|0)<($_pr|0)){$i_065=$77;$ssxmax_066=$_ssxmax_0;$ssymax_067=$ssymax_1;$c_068=$c_068+44|0;label=9;break}else{label=20;break};case 20:if(($_pr|0)==1){label=21;break}else{$ssymax_2=$ssymax_1;$ssxmax_2=$_ssxmax_0;label=22;break};case 21:HEAP32[31]=1;HEAP32[30]=1;$ssymax_2=1;$ssxmax_2=1;label=22;break;case 22:HEAP32[26]=$ssxmax_2<<3;HEAP32[27]=$ssymax_2<<3;$86=HEAP32[26]|0;HEAP32[24]=((HEAP32[22]|0)-1+$86|0)/($86|0)|0;$91=HEAP32[27]|0;HEAP32[25]=((HEAP32[23]|0)-1+$91|0)/($91|0)|0;if((HEAP32[28]|0)>0){label=23;break}else{label=35;break};case 23:$i_147=0;$c_148=116;label=24;break;case 24:$101=$c_148+4|0;$105=($ssxmax_2-1+(Math_imul(HEAP32[$101>>2]|0,HEAP32[22]|0)|0)|0)/($ssxmax_2|0)|0;$106=$c_148+12|0;HEAP32[$106>>2]=$105;$109=$c_148+20|0;HEAP32[$109>>2]=$105+7&2147483640;$111=$c_148+8|0;$116=$c_148+16|0;HEAP32[$116>>2]=($ssymax_2-1+(Math_imul(HEAP32[$111>>2]|0,HEAP32[23]|0)|0)|0)/($ssymax_2|0)|0;$119=Math_imul(HEAP32[26]|0,HEAP32[24]|0)|0;HEAP32[$109>>2]=(Math_imul($119,HEAP32[$101>>2]|0)|0)/($ssxmax_2|0)|0;if((HEAP32[$106>>2]|0)<3){label=25;break}else{label=26;break};case 25:if((HEAP32[$101>>2]|0)==($ssxmax_2|0)){label=26;break}else{label=28;break};case 26:if((HEAP32[$116>>2]|0)<3){label=27;break}else{label=29;break};case 27:if((HEAP32[$111>>2]|0)==($ssymax_2|0)){label=29;break}else{label=28;break};case 28:HEAP32[18]=2;label=36;break;case 29:$136=HEAP32[$109>>2]|0;$139=Math_imul(HEAP32[27]|0,HEAP32[25]|0)|0;$144=_malloc(Math_imul((Math_imul($139,HEAP32[$111>>2]|0)|0)/($ssymax_2|0)|0,$136)|0)|0;HEAP32[$c_148+40>>2]=$144;if(($144|0)==0){label=30;break}else{label=31;break};case 30:HEAP32[18]=3;label=36;break;case 31:$149=$i_147+1|0;$151=HEAP32[28]|0;if(($149|0)<($151|0)){$i_147=$149;$c_148=$c_148+44|0;label=24;break}else{label=32;break};case 32:if(($151|0)==3){label=33;break}else{label=35;break};case 33:$156=HEAP32[23]|0;$159=_malloc(Math_imul(Math_imul(HEAP32[22]|0,$151)|0,$156)|0)|0;HEAP32[131267]=$159;if(($159|0)==0){label=34;break}else{label=35;break};case 34:HEAP32[18]=3;label=36;break;case 35:_njSkip(HEAP32[21]|0);label=36;break;case 36:return}}function _njDecodeDHT(){var $1=0,$3=0,$7=0,$codelen_145=0,$vlc_044=0,$spread_041=0,$remain_040=0,$71=0,$72=0,$81=0,$vlc_132=0,$i_031=0,$90=0,$vlc_230=0,$j_029=0,$94=0,$vlc_2_lcssa=0,$97=0,$vlc_1_lcssa=0,$remain_1=0,$vlc_3=0,$100=0,$vlc_448=0,$remain_247=0,$103=0,$_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:_njDecodeLength();$1=HEAP32[21]|0;if(($1|0)>16){label=3;break}else{$_lcssa=$1;label=23;break};case 2:$3=HEAP32[21]|0;if(($3|0)>16){label=3;break}else{$_lcssa=$3;label=23;break};case 3:$7=HEAPU8[HEAP32[19]|0]|0;if(($7&236|0)==0){label=5;break}else{label=4;break};case 4:HEAP32[18]=5;label=25;break;case 5:if(($7&2|0)==0){label=7;break}else{label=6;break};case 6:HEAP32[18]=2;label=25;break;case 7:HEAP8[525096]=HEAP8[(HEAP32[19]|0)+1|0]|0;HEAP8[525097]=HEAP8[(HEAP32[19]|0)+2|0]|0;HEAP8[525098]=HEAP8[(HEAP32[19]|0)+3|0]|0;HEAP8[525099]=HEAP8[(HEAP32[19]|0)+4|0]|0;HEAP8[525100]=HEAP8[(HEAP32[19]|0)+5|0]|0;HEAP8[525101]=HEAP8[(HEAP32[19]|0)+6|0]|0;HEAP8[525102]=HEAP8[(HEAP32[19]|0)+7|0]|0;HEAP8[525103]=HEAP8[(HEAP32[19]|0)+8|0]|0;HEAP8[525104]=HEAP8[(HEAP32[19]|0)+9|0]|0;HEAP8[525105]=HEAP8[(HEAP32[19]|0)+10|0]|0;HEAP8[525106]=HEAP8[(HEAP32[19]|0)+11|0]|0;HEAP8[525107]=HEAP8[(HEAP32[19]|0)+12|0]|0;HEAP8[525108]=HEAP8[(HEAP32[19]|0)+13|0]|0;HEAP8[525109]=HEAP8[(HEAP32[19]|0)+14|0]|0;HEAP8[525110]=HEAP8[(HEAP32[19]|0)+15|0]|0;HEAP8[525111]=HEAP8[(HEAP32[19]|0)+16|0]|0;_njSkip(17);$remain_040=65536;$spread_041=32768;$vlc_044=512+((($7>>>3|$7)&3)<<17)|0;$codelen_145=1;label=8;break;case 8:$71=HEAP8[525096+($codelen_145-1)|0]|0;$72=$71&255;if($71<<24>>24==0){$vlc_3=$vlc_044;$remain_1=$remain_040;label=20;break}else{label=9;break};case 9:if((HEAP32[21]|0)<($72|0)){label=10;break}else{label=11;break};case 10:HEAP32[18]=5;label=25;break;case 11:$81=$remain_040-($72<<16-$codelen_145)|0;if(($81|0)<0){label=14;break}else{label=12;break};case 12:if($71<<24>>24==0){$vlc_1_lcssa=$vlc_044;label=19;break}else{label=13;break};case 13:$i_031=0;$vlc_132=$vlc_044;label=15;break;case 14:HEAP32[18]=5;label=25;break;case 15:$90=HEAP8[(HEAP32[19]|0)+$i_031|0]|0;if(($spread_041|0)==0){$vlc_2_lcssa=$vlc_132;label=18;break}else{$j_029=$spread_041;$vlc_230=$vlc_132;label=16;break};case 16:HEAP8[$vlc_230|0]=$codelen_145&255;HEAP8[$vlc_230+1|0]=$90;$94=$j_029-1|0;if(($94|0)==0){label=17;break}else{$j_029=$94;$vlc_230=$vlc_230+2|0;label=16;break};case 17:$vlc_2_lcssa=$vlc_132+($spread_041<<1)|0;label=18;break;case 18:$97=$i_031+1|0;if(($97|0)<($72|0)){$i_031=$97;$vlc_132=$vlc_2_lcssa;label=15;break}else{$vlc_1_lcssa=$vlc_2_lcssa;label=19;break};case 19:_njSkip($72);$vlc_3=$vlc_1_lcssa;$remain_1=$81;label=20;break;case 20:$100=$codelen_145+1|0;if(($100|0)<17){$remain_040=$remain_1;$spread_041=$spread_041>>1;$vlc_044=$vlc_3;$codelen_145=$100;label=8;break}else{label=21;break};case 21:if(($remain_1|0)==0){label=2;break}else{$remain_247=$remain_1;$vlc_448=$vlc_3;label=22;break};case 22:$103=$remain_247-1|0;HEAP8[$vlc_448|0]=0;if(($103|0)==0){label=2;break}else{$remain_247=$103;$vlc_448=$vlc_448+2|0;label=22;break};case 23:if(($_lcssa|0)==0){label=25;break}else{label=24;break};case 24:HEAP32[18]=5;label=25;break;case 25:return}}function _njDecodeDQT(){var $1=0,$5=0,$i_07=0,$14=0,$21=0,$_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:_njDecodeLength();$1=HEAP32[21]|0;if(($1|0)>64){label=2;break}else{$_lcssa=$1;label=7;break};case 2:$5=HEAPU8[HEAP32[19]|0]|0;if(($5&252|0)==0){label=4;break}else{label=3;break};case 3:HEAP32[18]=5;label=9;break;case 4:HEAP32[63]=HEAP32[63]|1<<$5;$i_07=0;label=5;break;case 5:$14=$i_07+1|0;HEAP8[256+($5<<6)+$i_07|0]=HEAP8[(HEAP32[19]|0)+$14|0]|0;if(($14|0)<64){$i_07=$14;label=5;break}else{label=6;break};case 6:_njSkip(65);$21=HEAP32[21]|0;if(($21|0)>64){label=2;break}else{$_lcssa=$21;label=7;break};case 7:if(($_lcssa|0)==0){label=9;break}else{label=8;break};case 8:HEAP32[18]=5;label=9;break;case 9:return}}function _njDecodeDRI(){var label=0;label=1;while(1)switch(label|0){case 1:_njDecodeLength();if((HEAP32[21]|0)<2){label=2;break}else{label=3;break};case 2:HEAP32[18]=5;label=4;break;case 3:HEAP32[131266]=(_njDecode16(HEAP32[19]|0)|0)&65535;_njSkip(HEAP32[21]|0);label=4;break;case 4:return}}function _njDecodeScan(){var $1=0,$3=0,$17=0,$18=0,$19=0,$20=0,$c_041=0,$i_040=0,$29=0,$43=0,$47=0,$48=0,$_lcssa37=0,$_lcssa=0,$mbx_0_ph_ph=0,$mby_0_ph_ph=0,$rstcount_0_ph_ph=0,$nextrst_0_ph_ph=0,$mbx_0_ph=0,$mby_0_ph=0,$rstcount_0_ph=0,$mbx_0=0,$mby_0=0,$c_131=0,$i_130=0,$64=0,$sby_029=0,$sbx_0=0,$71=0,$76=0,$78=0,$82=0,$89=0,$92=0,$96=0,$100=0,$mbx_1=0,$mby_1=0,$107=0,$110=0,$116=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[131266]|0;_njDecodeLength();$3=HEAP32[28]|0;if((HEAP32[21]|0)<(($3<<1)+4|0)){label=2;break}else{label=3;break};case 2:HEAP32[18]=5;label=34;break;case 3:if((HEAPU8[HEAP32[19]|0]|0)==($3|0)){label=5;break}else{label=4;break};case 4:HEAP32[18]=2;label=34;break;case 5:_njSkip(1);$17=HEAP32[19]|0;$18=HEAP8[$17]|0;if((HEAP32[28]|0)>0){$i_040=0;$c_041=116;$20=$17;$19=$18;label=6;break}else{$_lcssa=$17;$_lcssa37=$18;label=11;break};case 6:if(($19&255|0)==(HEAP32[$c_041>>2]|0)){label=8;break}else{label=7;break};case 7:HEAP32[18]=5;label=34;break;case 8:$29=HEAPU8[$20+1|0]|0;if(($29&238|0)==0){label=10;break}else{label=9;break};case 9:HEAP32[18]=5;label=34;break;case 10:HEAP32[$c_041+32>>2]=$29>>>4;HEAP32[$c_041+28>>2]=HEAP8[(HEAP32[19]|0)+1|0]&1|2;_njSkip(2);$43=$i_040+1|0;$47=HEAP32[19]|0;$48=HEAP8[$47]|0;if(($43|0)<(HEAP32[28]|0)){$i_040=$43;$c_041=$c_041+44|0;$20=$47;$19=$48;label=6;break}else{$_lcssa=$47;$_lcssa37=$48;label=11;break};case 11:if($_lcssa37<<24>>24==0){label=12;break}else{label=14;break};case 12:if((HEAP8[$_lcssa+1|0]|0)==63){label=13;break}else{label=14;break};case 13:if((HEAP8[$_lcssa+2|0]|0)==0){label=15;break}else{label=14;break};case 14:HEAP32[18]=2;label=34;break;case 15:_njSkip(HEAP32[21]|0);$nextrst_0_ph_ph=0;$rstcount_0_ph_ph=$1;$mby_0_ph_ph=0;$mbx_0_ph_ph=0;label=16;break;case 16:$rstcount_0_ph=$rstcount_0_ph_ph;$mby_0_ph=$mby_0_ph_ph;$mbx_0_ph=$mbx_0_ph_ph;label=17;break;case 17:$mby_0=$mby_0_ph;$mbx_0=$mbx_0_ph;label=18;break;case 18:if((HEAP32[28]|0)>0){$i_130=0;$c_131=116;label=19;break}else{label=26;break};case 19:$64=$c_131+8|0;if((HEAP32[$64>>2]|0)>0){label=20;break}else{label=25;break};case 20:$sby_029=0;label=21;break;case 21:$sbx_0=0;label=22;break;case 22:$71=HEAP32[$c_131+4>>2]|0;if(($sbx_0|0)<($71|0)){label=23;break}else{label=24;break};case 23:$76=(Math_imul(HEAP32[$64>>2]|0,$mby_0)|0)+$sby_029|0;$78=Math_imul($76,HEAP32[$c_131+20>>2]|0)|0;$82=(Math_imul($71,$mbx_0)|0)+$sbx_0+$78<<3;_njDecodeBlock($c_131,(HEAP32[$c_131+40>>2]|0)+$82|0);if((HEAP32[18]|0)==0){$sbx_0=$sbx_0+1|0;label=22;break}else{label=34;break};case 24:$89=$sby_029+1|0;if(($89|0)<(HEAP32[$64>>2]|0)){$sby_029=$89;label=21;break}else{label=25;break};case 25:$92=$i_130+1|0;if(($92|0)<(HEAP32[28]|0)){$i_130=$92;$c_131=$c_131+44|0;label=19;break}else{label=26;break};case 26:$96=$mbx_0+1|0;if(($96|0)<(HEAP32[24]|0)){$mby_1=$mby_0;$mbx_1=$96;label=28;break}else{label=27;break};case 27:$100=$mby_0+1|0;if(($100|0)<(HEAP32[25]|0)){$mby_1=$100;$mbx_1=0;label=28;break}else{label=33;break};case 28:if((HEAP32[131266]|0)==0){$mby_0=$mby_1;$mbx_0=$mbx_1;label=18;break}else{label=29;break};case 29:$107=$rstcount_0_ph-1|0;if(($107|0)==0){label=30;break}else{$rstcount_0_ph=$107;$mby_0_ph=$mby_1;$mbx_0_ph=$mbx_1;label=17;break};case 30:_njByteAlign();$110=_njGetBits(16)|0;if(($110&65528|0)==65488&($110&7|0)==($nextrst_0_ph_ph|0)){label=32;break}else{label=31;break};case 31:HEAP32[18]=5;label=34;break;case 32:$116=HEAP32[131266]|0;HEAP32[38]=0;HEAP32[49]=0;HEAP32[60]=0;$nextrst_0_ph_ph=$nextrst_0_ph_ph+1&7;$rstcount_0_ph_ph=$116;$mby_0_ph_ph=$mby_1;$mbx_0_ph_ph=$mbx_1;label=16;break;case 33:HEAP32[18]=6;label=34;break;case 34:return}}function _njSkipMarker(){_njDecodeLength();_njSkip(HEAP32[21]|0);return}function _njGetWidth(){return HEAP32[22]|0}function _njGetHeight(){return HEAP32[23]|0}function _njGetImage(){return((HEAP32[28]|0)==1?HEAP32[39]|0:HEAP32[131267]|0)|0}function _njGetImageSize(){var $3=0;$3=Math_imul(HEAP32[23]|0,HEAP32[22]|0)|0;return Math_imul($3,HEAP32[28]|0)|0}function _njClip($x){$x=$x|0;var label=0;label=1;while(1)switch(label|0){case 1:if(($x|0)<0){label=3;break}else{label=2;break};case 2:return(($x|0)>255?-1:$x&255)|0;case 3:return 0}return 0}function _njByteAlign(){HEAP32[131201]=HEAP32[131201]&248;return}function _njDecode16($pos){$pos=$pos|0;return(HEAPU8[$pos]|0)<<8|(HEAPU8[$pos+1|0]|0)|0}function _njShowBits($bits){$bits=$bits|0;var $2=0,$12=0,$15=0,$17=0,$31=0,$33=0,$36=0,$_lcssa=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($bits|0)==0){$_0=0;label=15;break}else{label=2;break};case 2:$2=HEAP32[131201]|0;if(($2|0)<($bits|0)){label=3;break}else{$_lcssa=$2;label=14;break};case 3:if((HEAP32[20]|0)<1){label=4;break}else{label=6;break};case 4:HEAP32[131200]=HEAP32[131200]<<8|255;HEAP32[131201]=(HEAP32[131201]|0)+8;label=5;break;case 5:$12=HEAP32[131201]|0;if(($12|0)<($bits|0)){label=3;break}else{$_lcssa=$12;label=14;break};case 6:$15=HEAP32[19]|0;HEAP32[19]=$15+1;$17=HEAP8[$15]|0;HEAP32[20]=(HEAP32[20]|0)-1;HEAP32[131201]=(HEAP32[131201]|0)+8;HEAP32[131200]=HEAP32[131200]<<8|$17&255;if($17<<24>>24==-1){label=7;break}else{label=5;break};case 7:if((HEAP32[20]|0)==0){label=13;break}else{label=8;break};case 8:$31=HEAP32[19]|0;HEAP32[19]=$31+1;$33=HEAP8[$31]|0;HEAP32[20]=(HEAP32[20]|0)-1;$36=$33&255;if(($36|0)==0|($36|0)==255){label=5;break}else if(($36|0)==217){label=9;break}else{label=10;break};case 9:HEAP32[20]=0;label=5;break;case 10:if(($36&248|0)==208){label=12;break}else{label=11;break};case 11:HEAP32[18]=5;label=5;break;case 12:HEAP32[131200]=HEAP32[131200]<<8|$36;HEAP32[131201]=(HEAP32[131201]|0)+8;label=5;break;case 13:HEAP32[18]=5;label=5;break;case 14:$_0=HEAP32[131200]>>$_lcssa-$bits&(1<<$bits)-1;label=15;break;case 15:return $_0|0}return 0}function _njConvert(){var $i_048=0,$c_047=0,$3=0,$19=0,$41=0,$43=0,$47=0,$pcr_032=0,$pcb_031=0,$py_030=0,$prgb_029=0,$yy_028=0,$x_027=0,$prgb_126=0,$58=0,$62=0,$66=0,$86=0,$87=0,$prgb_1_lcssa=0,$96=0,$98=0,$99=0,$102=0,$y1_033=0,$105=0,$109=0,$y1_036=0,$pout_035=0,$pin_034=0,$112=0,$y1_0=0,$_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[28]|0)>0){$c_047=116;$i_048=0;label=2;break}else{label=22;break};case 2:$3=$c_047+12|0;label=3;break;case 3:if((HEAP32[$3>>2]|0)<(HEAP32[22]|0)){label=4;break}else{label=5;break};case 4:if((HEAP32[$3>>2]|0)<(HEAP32[22]|0)){label=7;break}else{label=8;break};case 5:$19=(HEAP32[$3>>2]|0)<(HEAP32[22]|0);if((HEAP32[$c_047+16>>2]|0)<(HEAP32[23]|0)){label=6;break}else{label=12;break};case 6:if($19){label=7;break}else{label=8;break};case 7:_njUpsampleH($c_047);label=8;break;case 8:if((HEAP32[18]|0)==0){label=9;break}else{label=27;break};case 9:if((HEAP32[$c_047+16>>2]|0)<(HEAP32[23]|0)){label=10;break}else{label=11;break};case 10:_njUpsampleV($c_047);label=11;break;case 11:if((HEAP32[18]|0)==0){label=3;break}else{label=27;break};case 12:if($19){label=14;break}else{label=13;break};case 13:if((HEAP32[$c_047+16>>2]|0)<(HEAP32[23]|0)){label=14;break}else{label=15;break};case 14:HEAP32[18]=4;label=27;break;case 15:$41=$i_048+1|0;$43=HEAP32[28]|0;if(($41|0)<($43|0)){$c_047=$c_047+44|0;$i_048=$41;label=2;break}else{label=16;break};case 16:if(($43|0)==3){label=17;break}else{label=22;break};case 17:$47=HEAP32[23]|0;if(($47|0)==0){label=27;break}else{label=18;break};case 18:$yy_028=$47;$prgb_029=HEAP32[131267]|0;$py_030=HEAP32[39]|0;$pcb_031=HEAP32[50]|0;$pcr_032=HEAP32[61]|0;label=19;break;case 19:if((HEAP32[22]|0)>0){$prgb_126=$prgb_029;$x_027=0;label=20;break}else{$prgb_1_lcssa=$prgb_029;label=21;break};case 20:$58=(HEAPU8[$py_030+$x_027|0]|0)<<8;$62=(HEAPU8[$pcb_031+$x_027|0]|0)-128|0;$66=(HEAPU8[$pcr_032+$x_027|0]|0)-128|0;HEAP8[$prgb_126]=_njClip(($58|128)+($66*359|0)>>8)|0;HEAP8[$prgb_126+1|0]=_njClip(($58|128)+($62*-88|0)+($66*-183|0)>>8)|0;$86=$prgb_126+3|0;HEAP8[$prgb_126+2|0]=_njClip(($58|128)+($62*454|0)>>8)|0;$87=$x_027+1|0;if(($87|0)<(HEAP32[22]|0)){$prgb_126=$86;$x_027=$87;label=20;break}else{$prgb_1_lcssa=$86;label=21;break};case 21:$96=$yy_028-1|0;if(($96|0)==0){label=27;break}else{$yy_028=$96;$prgb_029=$prgb_1_lcssa;$py_030=$py_030+(HEAP32[34]|0)|0;$pcb_031=$pcb_031+(HEAP32[45]|0)|0;$pcr_032=$pcr_032+(HEAP32[56]|0)|0;label=19;break};case 22:$98=HEAP32[32]|0;$99=HEAP32[34]|0;if(($98|0)==($99|0)){label=27;break}else{label=23;break};case 23:$102=HEAP32[39]|0;$y1_033=(HEAP32[33]|0)-1|0;$105=HEAP32[32]|0;if(($y1_033|0)==0){$_lcssa=$105;label=26;break}else{label=24;break};case 24:$pin_034=$102+$99|0;$pout_035=$102+$98|0;$y1_036=$y1_033;$109=$105;label=25;break;case 25:_memcpy($pout_035|0,$pin_034|0,$109)|0;$112=HEAP32[32]|0;$y1_0=$y1_036-1|0;if(($y1_0|0)==0){$_lcssa=$112;label=26;break}else{$pin_034=$pin_034+(HEAP32[34]|0)|0;$pout_035=$pout_035+$112|0;$y1_036=$y1_0;$109=$112;label=25;break};case 26:HEAP32[34]=$_lcssa;label=27;break;case 27:return}}function _convert($jpgBuffer,$lengthOfFile,$resultBuffer,$widthPtr,$heightPtr){$jpgBuffer=$jpgBuffer|0;$lengthOfFile=$lengthOfFile|0;$resultBuffer=$resultBuffer|0;$widthPtr=$widthPtr|0;$heightPtr=$heightPtr|0;var $_0=0,label=0;label=1;while(1)switch(label|0){case 1:_njInit();if((_njDecode($jpgBuffer,$lengthOfFile)|0)==0){label=2;break}else{$_0=1;label=3;break};case 2:HEAP32[$resultBuffer>>2]=_njGetImage()|0;HEAP32[$widthPtr>>2]=_njGetWidth()|0;HEAP32[$heightPtr>>2]=_njGetHeight()|0;$_0=_njGetImageSize()|0;label=3;break;case 3:return $_0|0}return 0}function _njUpsampleH($c){$c=$c|0;var $1=0,$2=0,$3=0,$4=0,$8=0,$12=0,$13=0,$y_066=0,$lout_065=0,$lin_064=0,$22=0,$36=0,$x_063=0,$61=0,$65=0,$66=0,$71=0,$76=0,$86=0,$110=0,$113=0,$115=0,$119=0,$123=0,$159=0,$162=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$c+12|0;$2=HEAP32[$1>>2]|0;$3=$2-3|0;$4=$c+16|0;$8=_malloc(Math_imul($2<<1,HEAP32[$4>>2]|0)|0)|0;if(($8|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[18]=3;label=9;break;case 3:$12=$c+40|0;$13=HEAP32[$4>>2]|0;if(($13|0)==0){label=8;break}else{label=4;break};case 4:$lin_064=HEAP32[$12>>2]|0;$lout_065=$8;$y_066=$13;label=5;break;case 5:$22=$lin_064+1|0;HEAP8[$lout_065]=_njClip(((HEAPU8[$lin_064]|0)*139|0)+64+((HEAPU8[$22]|0)*-11|0)>>7)|0;$36=$lin_064+2|0;HEAP8[$lout_065+1|0]=_njClip(((HEAPU8[$lin_064]|0)*104|0)+64+((HEAPU8[$22]|0)*27|0)+((HEAPU8[$36]|0)*-3|0)>>7)|0;HEAP8[$lout_065+2|0]=_njClip(((HEAPU8[$lin_064]|0)*28|0)+64+((HEAPU8[$22]|0)*109|0)+((HEAPU8[$36]|0)*-9|0)>>7)|0;if(($3|0)>0){$x_063=0;label=6;break}else{label=7;break};case 6:$61=$lin_064+$x_063|0;$65=$x_063+1|0;$66=$lin_064+$65|0;$71=$lin_064+($x_063+2)|0;$76=$lin_064+($x_063+3)|0;$86=$x_063<<1;HEAP8[$lout_065+($86+3)|0]=_njClip(((HEAPU8[$61]|0)*-9|0)+64+((HEAPU8[$66]|0)*111|0)+((HEAPU8[$71]|0)*29|0)+((HEAPU8[$76]|0)*-3|0)>>7)|0;HEAP8[$lout_065+($86+4)|0]=_njClip(((HEAPU8[$61]|0)*-3|0)+64+((HEAPU8[$66]|0)*29|0)+((HEAPU8[$71]|0)*111|0)+((HEAPU8[$76]|0)*-9|0)>>7)|0;if(($65|0)<($3|0)){$x_063=$65;label=6;break}else{label=7;break};case 7:$110=HEAP32[$c+20>>2]|0;$113=HEAP32[$1>>2]<<1;$115=$lin_064+($110-1)|0;$119=$lin_064+($110-2)|0;$123=$lin_064+($110-3)|0;HEAP8[$lout_065+($113-3)|0]=_njClip(((HEAPU8[$115]|0)*28|0)+64+((HEAPU8[$119]|0)*109|0)+((HEAPU8[$123]|0)*-9|0)>>7)|0;HEAP8[$lout_065+($113-2)|0]=_njClip(((HEAPU8[$115]|0)*104|0)+64+((HEAPU8[$119]|0)*27|0)+((HEAPU8[$123]|0)*-3|0)>>7)|0;HEAP8[$lout_065+($113-1)|0]=_njClip(((HEAPU8[$115]|0)*139|0)+64+((HEAPU8[$119]|0)*-11|0)>>7)|0;$159=$y_066-1|0;if(($159|0)==0){label=8;break}else{$lin_064=$lin_064+$110|0;$lout_065=$lout_065+$113|0;$y_066=$159;label=5;break};case 8:$162=HEAP32[$1>>2]<<1;HEAP32[$1>>2]=$162;HEAP32[$c+20>>2]=$162;_free(HEAP32[$12>>2]|0);HEAP32[$12>>2]=$8;label=9;break;case 9:return}}function _njUpsampleV($c){$c=$c|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$10=0,$indvars_iv100=0,$indvars_iv=0,$19=0,$20=0,$25=0,$_sum82=0,$40=0,$_sum84=0,$64=0,$65=0,$66=0,$69=0,$72=0,$y_092=0,$cout_091=0,$cin_090=0,$74=0,$81=0,$85=0,$115=0,$cout_0_lcssa=0,$cin_0_lcssa=0,$118=0,$125=0,$indvars_iv_next=0,$164=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$c+12|0;$2=HEAP32[$1>>2]|0;$3=$c+20|0;$4=HEAP32[$3>>2]|0;$5=$4<<1;$6=$c+16|0;$10=_malloc(Math_imul($2<<1,HEAP32[$6>>2]|0)|0)|0;if(($10|0)==0){label=4;break}else{label=2;break};case 2:if(($2|0)>0){label=3;break}else{label=10;break};case 3:$indvars_iv=$10+($2*5|0)|0;$indvars_iv100=0;label=5;break;case 4:HEAP32[18]=3;label=11;break;case 5:$19=HEAP32[$c+40>>2]|0;$20=$19+$indvars_iv100|0;$25=$19+($indvars_iv100+$4)|0;HEAP8[$10+$indvars_iv100|0]=_njClip(((HEAPU8[$20]|0)*139|0)+64+((HEAPU8[$25]|0)*-11|0)>>7)|0;$_sum82=$indvars_iv100+$2|0;$40=$19+($indvars_iv100+$5)|0;HEAP8[$10+$_sum82|0]=_njClip(((HEAPU8[$20]|0)*104|0)+64+((HEAPU8[$25]|0)*27|0)+((HEAPU8[$40]|0)*-3|0)>>7)|0;$_sum84=$_sum82+$2|0;HEAP8[$10+$_sum84|0]=_njClip(((HEAPU8[$20]|0)*28|0)+64+((HEAPU8[$25]|0)*109|0)+((HEAPU8[$40]|0)*-9|0)>>7)|0;$64=$10+($_sum84+$2)|0;$65=HEAP32[$6>>2]|0;$66=$65-3|0;if(($66|0)==0){$cin_0_lcssa=$25;$cout_0_lcssa=$64;label=9;break}else{label=6;break};case 6:$69=Math_imul($2<<1,$65-4|0)|0;$72=$indvars_iv100+(Math_imul($4,$65-2|0)|0)|0;$cin_090=$25;$cout_091=$64;$y_092=$66;label=7;break;case 7:$74=$cin_090+(-$4|0)|0;$81=$cin_090+$4|0;$85=$cin_090+$5|0;HEAP8[$cout_091]=_njClip(((HEAPU8[$74]|0)*-9|0)+64+((HEAPU8[$cin_090]|0)*111|0)+((HEAPU8[$81]|0)*29|0)+((HEAPU8[$85]|0)*-3|0)>>7)|0;HEAP8[$cout_091+$2|0]=_njClip(((HEAPU8[$74]|0)*-3|0)+64+((HEAPU8[$cin_090]|0)*29|0)+((HEAPU8[$81]|0)*111|0)+((HEAPU8[$85]|0)*-9|0)>>7)|0;$115=$y_092-1|0;if(($115|0)==0){label=8;break}else{$cin_090=$81;$cout_091=$cout_091+($2<<1)|0;$y_092=$115;label=7;break};case 8:$cin_0_lcssa=$19+$72|0;$cout_0_lcssa=$indvars_iv+$69|0;label=9;break;case 9:$118=$cin_0_lcssa+$4|0;$125=$cin_0_lcssa+($4-$5)|0;HEAP8[$cout_0_lcssa]=_njClip(((HEAPU8[$118]|0)*28|0)+64+((HEAPU8[$cin_0_lcssa]|0)*109|0)+((HEAPU8[$125]|0)*-9|0)>>7)|0;HEAP8[$cout_0_lcssa+$2|0]=_njClip(((HEAPU8[$118]|0)*104|0)+64+((HEAPU8[$cin_0_lcssa]|0)*27|0)+((HEAPU8[$125]|0)*-3|0)>>7)|0;HEAP8[$cout_0_lcssa+($2<<1)|0]=_njClip(((HEAPU8[$118]|0)*139|0)+64+((HEAPU8[$cin_0_lcssa]|0)*-11|0)>>7)|0;$indvars_iv_next=$indvars_iv100+1|0;if(($indvars_iv_next|0)<($2|0)){$indvars_iv=$indvars_iv+1|0;$indvars_iv100=$indvars_iv_next;label=5;break}else{label=10;break};case 10:HEAP32[$6>>2]=HEAP32[$6>>2]<<1;HEAP32[$3>>2]=HEAP32[$1>>2];$164=$c+40|0;_free(HEAP32[$164>>2]|0);HEAP32[$164>>2]=$10;label=11;break;case 11:return}}function _njDecodeLength(){var $7=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[20]|0)<2){label=2;break}else{label=3;break};case 2:HEAP32[18]=5;label=6;break;case 3:$7=(_njDecode16(HEAP32[19]|0)|0)&65535;HEAP32[21]=$7;if(($7|0)>(HEAP32[20]|0)){label=4;break}else{label=5;break};case 4:HEAP32[18]=5;label=6;break;case 5:_njSkip(2);label=6;break;case 6:return}}function _njDecodeBlock($c,$out){$c=$c|0;$out=$out|0;var $code=0,$4=0,$5=0,$7=0,$8=0,$coef_0=0,$18=0,$19=0,$30=0,$38=0,$coef_121=0,$46=0,$coef_219=0,$52=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$code=sp|0;HEAP8[$code]=0;_memset(524808,0,256);$4=_njGetVLC(512+(HEAP32[$c+32>>2]<<17)|0,0)|0;$5=$c+36|0;$7=(HEAP32[$5>>2]|0)+$4|0;HEAP32[$5>>2]=$7;$8=$c+24|0;HEAP32[131202]=Math_imul(HEAPU8[256+(HEAP32[$8>>2]<<6)|0]|0,$7)|0;$coef_0=0;label=2;break;case 2:$18=_njGetVLC(512+(HEAP32[$c+28>>2]<<17)|0,$code)|0;$19=HEAP8[$code]|0;if($19<<24>>24==0){$coef_121=0;label=9;break}else{label=3;break};case 3:if(($19&15)!=0|$19<<24>>24==-16){label=5;break}else{label=4;break};case 4:HEAP32[18]=5;label=11;break;case 5:$30=$coef_0+1+(($19&255)>>>4)|0;if(($30|0)>63){label=6;break}else{label=7;break};case 6:HEAP32[18]=5;label=11;break;case 7:$38=Math_imul(HEAPU8[256+(HEAP32[$8>>2]<<6)+$30|0]|0,$18)|0;HEAP32[524808+(HEAP8[8+$30|0]<<2)>>2]=$38;if(($30|0)<63){$coef_0=$30;label=2;break}else{$coef_121=0;label=9;break};case 8:$coef_219=0;label=10;break;case 9:_njRowIDCT(524808+($coef_121<<2)|0);$46=$coef_121+8|0;if(($46|0)<64){$coef_121=$46;label=9;break}else{label=8;break};case 10:_njColIDCT(524808+($coef_219<<2)|0,$out+$coef_219|0,HEAP32[$c+20>>2]|0);$52=$coef_219+1|0;if(($52|0)<8){$coef_219=$52;label=10;break}else{label=11;break};case 11:STACKTOP=sp;return}}function _njGetBits($bits){$bits=$bits|0;var $1=0;$1=_njShowBits($bits)|0;_njSkipBits($bits);return $1|0}function _njSkipBits($bits){$bits=$bits|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[131201]|0)<($bits|0)){label=2;break}else{label=3;break};case 2:_njShowBits($bits)|0;label=3;break;case 3:HEAP32[131201]=(HEAP32[131201]|0)-$bits;return}}function _njRowIDCT($blk){$blk=$blk|0;var $1=0,$3=0,$4=0,$5=0,$7=0,$8=0,$10=0,$11=0,$13=0,$14=0,$16=0,$17=0,$19=0,$20=0,$23=0,$25=0,$28=0,$30=0,$32=0,$34=0,$36=0,$38=0,$40=0,$41=0,$42=0,$44=0,$46=0,$48=0,$49=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$56=0,$60=0,$64=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$blk+16|0;$3=HEAP32[$1>>2]<<11;$4=$blk+24|0;$5=HEAP32[$4>>2]|0;$7=$blk+8|0;$8=HEAP32[$7>>2]|0;$10=$blk+4|0;$11=HEAP32[$10>>2]|0;$13=$blk+28|0;$14=HEAP32[$13>>2]|0;$16=$blk+20|0;$17=HEAP32[$16>>2]|0;$19=$blk+12|0;$20=HEAP32[$19>>2]|0;$23=HEAP32[$blk>>2]|0;if(($3|$5|$8|$11|$14|$17|$20|0)==0){label=2;break}else{label=3;break};case 2:$25=$23<<3;HEAP32[$13>>2]=$25;HEAP32[$4>>2]=$25;HEAP32[$16>>2]=$25;HEAP32[$1>>2]=$25;HEAP32[$19>>2]=$25;HEAP32[$7>>2]=$25;HEAP32[$10>>2]=$25;HEAP32[$blk>>2]=$25;label=4;break;case 3:$28=$23<<11|128;$30=($14+$11|0)*565|0;$32=$30+($11*2276|0)|0;$34=$30+($14*-3406|0)|0;$36=($20+$17|0)*2408|0;$38=$36+($17*-799|0)|0;$40=$36+($20*-4017|0)|0;$41=$28+$3|0;$42=$28-$3|0;$44=($8+$5|0)*1108|0;$46=$44+($5*-3784|0)|0;$48=$44+($8*1568|0)|0;$49=$38+$32|0;$50=$32-$38|0;$51=$40+$34|0;$52=$34-$40|0;$53=$41+$48|0;$54=$41-$48|0;$55=$42+$46|0;$56=$42-$46|0;$60=(($50+$52|0)*181|0)+128>>8;$64=(($50-$52|0)*181|0)+128>>8;HEAP32[$blk>>2]=$53+$49>>8;HEAP32[$10>>2]=$60+$55>>8;HEAP32[$7>>2]=$64+$56>>8;HEAP32[$19>>2]=$54+$51>>8;HEAP32[$1>>2]=$54-$51>>8;HEAP32[$16>>2]=$56-$64>>8;HEAP32[$4>>2]=$55-$60>>8;HEAP32[$13>>2]=$53-$49>>8;label=4;break;case 4:return}}function _njGetVLC($vlc,$code){$vlc=$vlc|0;$code=$code|0;var $1=0,$3=0,$9=0,$14=0,$17=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_njShowBits(16)|0;$3=HEAP8[$vlc+($1<<1)|0]|0;if($3<<24>>24==0){label=2;break}else{label=3;break};case 2:HEAP32[18]=5;$_0=0;label=8;break;case 3:_njSkipBits($3&255);$9=HEAP8[$vlc+($1<<1)+1|0]|0;if(($code|0)==0){label=5;break}else{label=4;break};case 4:HEAP8[$code]=$9;label=5;break;case 5:$14=$9&15;if(($14|0)==0){$_0=0;label=8;break}else{label=6;break};case 6:$17=_njGetBits($14)|0;if(($17|0)<(1<<$14-1|0)){label=7;break}else{$_0=$17;label=8;break};case 7:$_0=(-1<<$14)+1+$17|0;label=8;break;case 8:return $_0|0}return 0}function _njColIDCT($blk,$out,$stride){$blk=$blk|0;$out=$out|0;$stride=$stride|0;var $3=0,$5=0,$8=0,$11=0,$14=0,$17=0,$20=0,$23=0,$27=0,$_sum92=0,$_sum93=0,$_sum94=0,$_sum95=0,$_sum96=0,$37=0,$40=0,$43=0,$46=0,$49=0,$52=0,$55=0,$56=0,$57=0,$60=0,$63=0,$66=0,$67=0,$68=0,$69=0,$70=0,$71=0,$72=0,$73=0,$74=0,$78=0,$82=0,$_sum=0,$_sum85=0,$_sum86=0,$_sum87=0,$_sum88=0,label=0;label=1;while(1)switch(label|0){case 1:$3=HEAP32[$blk+128>>2]<<8;$5=HEAP32[$blk+192>>2]|0;$8=HEAP32[$blk+64>>2]|0;$11=HEAP32[$blk+32>>2]|0;$14=HEAP32[$blk+224>>2]|0;$17=HEAP32[$blk+160>>2]|0;$20=HEAP32[$blk+96>>2]|0;$23=HEAP32[$blk>>2]|0;if(($3|$5|$8|$11|$14|$17|$20|0)==0){label=2;break}else{label=3;break};case 2:$27=_njClip(($23+32>>6)+128|0)|0;HEAP8[$out]=$27;HEAP8[$out+$stride|0]=$27;$_sum92=$stride<<1;HEAP8[$out+$_sum92|0]=$27;$_sum93=$_sum92+$stride|0;HEAP8[$out+$_sum93|0]=$27;$_sum94=$_sum93+$stride|0;HEAP8[$out+$_sum94|0]=$27;$_sum95=$_sum94+$stride|0;HEAP8[$out+$_sum95|0]=$27;$_sum96=$_sum95+$stride|0;HEAP8[$out+$_sum96|0]=$27;HEAP8[$out+($_sum96+$stride)|0]=$27;label=4;break;case 3:$37=($23<<8)+8192|0;$40=(($14+$11|0)*565|0)+4|0;$43=$40+($11*2276|0)>>3;$46=$40+($14*-3406|0)>>3;$49=($20+$17|0)*2408|0|4;$52=$49+($17*-799|0)>>3;$55=$49+($20*-4017|0)>>3;$56=$37+$3|0;$57=$37-$3|0;$60=(($8+$5|0)*1108|0)+4|0;$63=$60+($5*-3784|0)>>3;$66=$60+($8*1568|0)>>3;$67=$52+$43|0;$68=$43-$52|0;$69=$55+$46|0;$70=$46-$55|0;$71=$56+$66|0;$72=$56-$66|0;$73=$57+$63|0;$74=$57-$63|0;$78=(($68+$70|0)*181|0)+128>>8;$82=(($68-$70|0)*181|0)+128>>8;HEAP8[$out]=_njClip(($67+$71>>14)+128|0)|0;HEAP8[$out+$stride|0]=_njClip(($78+$73>>14)+128|0)|0;$_sum=$stride<<1;HEAP8[$out+$_sum|0]=_njClip(($82+$74>>14)+128|0)|0;$_sum85=$_sum+$stride|0;HEAP8[$out+$_sum85|0]=_njClip(($69+$72>>14)+128|0)|0;$_sum86=$_sum85+$stride|0;HEAP8[$out+$_sum86|0]=_njClip(($72-$69>>14)+128|0)|0;$_sum87=$_sum86+$stride|0;HEAP8[$out+$_sum87|0]=_njClip(($74-$82>>14)+128|0)|0;$_sum88=$_sum87+$stride|0;HEAP8[$out+$_sum88|0]=_njClip(($73-$78>>14)+128|0)|0;HEAP8[$out+($_sum88+$stride)|0]=_njClip(($71-$67>>14)+128|0)|0;label=4;break;case 4:return}}function _malloc($bytes){$bytes=$bytes|0;var $8=0,$9=0,$10=0,$11=0,$17=0,$18=0,$20=0,$21=0,$22=0,$23=0,$24=0,$35=0,$40=0,$45=0,$56=0,$59=0,$62=0,$64=0,$65=0,$67=0,$69=0,$71=0,$73=0,$75=0,$77=0,$79=0,$82=0,$83=0,$85=0,$86=0,$87=0,$88=0,$89=0,$100=0,$105=0,$106=0,$109=0,$117=0,$120=0,$121=0,$122=0,$124=0,$125=0,$126=0,$132=0,$133=0,$_pre_phi=0,$F4_0=0,$145=0,$150=0,$152=0,$153=0,$155=0,$157=0,$159=0,$161=0,$163=0,$165=0,$167=0,$172=0,$rsize_0_i=0,$v_0_i=0,$t_0_i=0,$179=0,$183=0,$185=0,$189=0,$190=0,$192=0,$193=0,$196=0,$201=0,$203=0,$207=0,$211=0,$215=0,$220=0,$221=0,$224=0,$225=0,$RP_0_i=0,$R_0_i=0,$227=0,$228=0,$231=0,$232=0,$R_1_i=0,$242=0,$244=0,$258=0,$274=0,$286=0,$300=0,$304=0,$315=0,$318=0,$319=0,$320=0,$322=0,$323=0,$324=0,$330=0,$331=0,$_pre_phi_i=0,$F1_0_i=0,$342=0,$348=0,$349=0,$350=0,$353=0,$354=0,$361=0,$362=0,$365=0,$367=0,$370=0,$375=0,$idx_0_i=0,$383=0,$391=0,$rst_0_i=0,$sizebits_0_i=0,$t_0_i116=0,$rsize_0_i117=0,$v_0_i118=0,$396=0,$397=0,$rsize_1_i=0,$v_1_i=0,$403=0,$406=0,$rst_1_i=0,$t_1_i=0,$rsize_2_i=0,$v_2_i=0,$414=0,$417=0,$422=0,$424=0,$425=0,$427=0,$429=0,$431=0,$433=0,$435=0,$437=0,$439=0,$t_2_ph_i=0,$v_330_i=0,$rsize_329_i=0,$t_228_i=0,$449=0,$450=0,$_rsize_3_i=0,$t_2_v_3_i=0,$452=0,$455=0,$v_3_lcssa_i=0,$rsize_3_lcssa_i=0,$463=0,$464=0,$467=0,$468=0,$472=0,$474=0,$478=0,$482=0,$486=0,$491=0,$492=0,$495=0,$496=0,$RP_0_i119=0,$R_0_i120=0,$498=0,$499=0,$502=0,$503=0,$R_1_i122=0,$513=0,$515=0,$529=0,$545=0,$557=0,$571=0,$575=0,$586=0,$589=0,$591=0,$592=0,$593=0,$599=0,$600=0,$_pre_phi_i128=0,$F5_0_i=0,$612=0,$613=0,$620=0,$621=0,$624=0,$626=0,$629=0,$634=0,$I7_0_i=0,$641=0,$648=0,$649=0,$668=0,$T_0_i=0,$K12_0_i=0,$677=0,$678=0,$694=0,$695=0,$697=0,$711=0,$nb_0=0,$714=0,$717=0,$718=0,$721=0,$736=0,$743=0,$746=0,$747=0,$748=0,$762=0,$772=0,$773=0,$774=0,$775=0,$776=0,$779=0,$782=0,$783=0,$791=0,$794=0,$sp_0_i_i=0,$796=0,$797=0,$800=0,$806=0,$809=0,$812=0,$813=0,$814=0,$ssize_0_i=0,$824=0,$825=0,$829=0,$835=0,$836=0,$840=0,$843=0,$847=0,$ssize_1_i=0,$br_0_i=0,$tsize_0_i=0,$tbase_0_i=0,$856=0,$860=0,$ssize_2_i=0,$tsize_0303639_i=0,$tsize_1_i=0,$876=0,$877=0,$881=0,$883=0,$_tbase_1_i=0,$tbase_245_i=0,$tsize_244_i=0,$886=0,$890=0,$893=0,$i_02_i_i=0,$899=0,$901=0,$904=0,$908=0,$914=0,$917=0,$sp_067_i=0,$925=0,$926=0,$927=0,$932=0,$939=0,$944=0,$946=0,$947=0,$949=0,$955=0,$958=0,$sp_160_i=0,$970=0,$975=0,$982=0,$986=0,$993=0,$996=0,$1003=0,$1004=0,$1005=0,$_sum_i21_i=0,$1009=0,$1010=0,$1011=0,$1019=0,$1028=0,$_sum2_i23_i=0,$1037=0,$1041=0,$1042=0,$1047=0,$1050=0,$1053=0,$1076=0,$_pre_phi57_i_i=0,$1081=0,$1084=0,$1087=0,$1092=0,$1097=0,$1101=0,$_sum67_i_i=0,$1107=0,$1108=0,$1112=0,$1113=0,$RP_0_i_i=0,$R_0_i_i=0,$1115=0,$1116=0,$1119=0,$1120=0,$R_1_i_i=0,$1132=0,$1134=0,$1148=0,$_sum3233_i_i=0,$1165=0,$1178=0,$qsize_0_i_i=0,$oldfirst_0_i_i=0,$1194=0,$1202=0,$1205=0,$1207=0,$1208=0,$1209=0,$1215=0,$1216=0,$_pre_phi_i25_i=0,$F4_0_i_i=0,$1228=0,$1229=0,$1236=0,$1237=0,$1240=0,$1242=0,$1245=0,$1250=0,$I7_0_i_i=0,$1257=0,$1264=0,$1265=0,$1284=0,$T_0_i27_i=0,$K8_0_i_i=0,$1293=0,$1294=0,$1310=0,$1311=0,$1313=0,$1327=0,$sp_0_i_i_i=0,$1330=0,$1334=0,$1335=0,$1341=0,$1348=0,$1349=0,$1353=0,$1354=0,$1358=0,$1364=0,$1367=0,$1377=0,$1380=0,$1381=0,$1389=0,$1392=0,$1398=0,$1401=0,$1403=0,$1404=0,$1405=0,$1411=0,$1412=0,$_pre_phi_i_i=0,$F_0_i_i=0,$1422=0,$1423=0,$1430=0,$1431=0,$1434=0,$1436=0,$1439=0,$1444=0,$I1_0_i_i=0,$1451=0,$1455=0,$1456=0,$1471=0,$T_0_i_i=0,$K2_0_i_i=0,$1480=0,$1481=0,$1494=0,$1495=0,$1497=0,$1507=0,$1510=0,$1511=0,$1512=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($bytes>>>0<245){label=2;break}else{label=78;break};case 2:if($bytes>>>0<11){$8=16;label=4;break}else{label=3;break};case 3:$8=$bytes+11&-8;label=4;break;case 4:$9=$8>>>3;$10=HEAP32[131278]|0;$11=$10>>>($9>>>0);if(($11&3|0)==0){label=12;break}else{label=5;break};case 5:$17=($11&1^1)+$9|0;$18=$17<<1;$20=525152+($18<<2)|0;$21=525152+($18+2<<2)|0;$22=HEAP32[$21>>2]|0;$23=$22+8|0;$24=HEAP32[$23>>2]|0;if(($20|0)==($24|0)){label=6;break}else{label=7;break};case 6:HEAP32[131278]=$10&~(1<<$17);label=11;break;case 7:if($24>>>0<(HEAP32[131282]|0)>>>0){label=10;break}else{label=8;break};case 8:$35=$24+12|0;if((HEAP32[$35>>2]|0)==($22|0)){label=9;break}else{label=10;break};case 9:HEAP32[$35>>2]=$20;HEAP32[$21>>2]=$24;label=11;break;case 10:_abort();return 0;return 0;case 11:$40=$17<<3;HEAP32[$22+4>>2]=$40|3;$45=$22+($40|4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]|1;$mem_0=$23;label=341;break;case 12:if($8>>>0>(HEAP32[131280]|0)>>>0){label=13;break}else{$nb_0=$8;label=160;break};case 13:if(($11|0)==0){label=27;break}else{label=14;break};case 14:$56=2<<$9;$59=$11<<$9&($56|-$56);$62=($59&-$59)-1|0;$64=$62>>>12&16;$65=$62>>>($64>>>0);$67=$65>>>5&8;$69=$65>>>($67>>>0);$71=$69>>>2&4;$73=$69>>>($71>>>0);$75=$73>>>1&2;$77=$73>>>($75>>>0);$79=$77>>>1&1;$82=($67|$64|$71|$75|$79)+($77>>>($79>>>0))|0;$83=$82<<1;$85=525152+($83<<2)|0;$86=525152+($83+2<<2)|0;$87=HEAP32[$86>>2]|0;$88=$87+8|0;$89=HEAP32[$88>>2]|0;if(($85|0)==($89|0)){label=15;break}else{label=16;break};case 15:HEAP32[131278]=$10&~(1<<$82);label=20;break;case 16:if($89>>>0<(HEAP32[131282]|0)>>>0){label=19;break}else{label=17;break};case 17:$100=$89+12|0;if((HEAP32[$100>>2]|0)==($87|0)){label=18;break}else{label=19;break};case 18:HEAP32[$100>>2]=$85;HEAP32[$86>>2]=$89;label=20;break;case 19:_abort();return 0;return 0;case 20:$105=$82<<3;$106=$105-$8|0;HEAP32[$87+4>>2]=$8|3;$109=$87;HEAP32[$109+($8|4)>>2]=$106|1;HEAP32[$109+$105>>2]=$106;$117=HEAP32[131280]|0;if(($117|0)==0){label=26;break}else{label=21;break};case 21:$120=HEAP32[131283]|0;$121=$117>>>3;$122=$121<<1;$124=525152+($122<<2)|0;$125=HEAP32[131278]|0;$126=1<<$121;if(($125&$126|0)==0){label=22;break}else{label=23;break};case 22:HEAP32[131278]=$125|$126;$F4_0=$124;$_pre_phi=525152+($122+2<<2)|0;label=25;break;case 23:$132=525152+($122+2<<2)|0;$133=HEAP32[$132>>2]|0;if($133>>>0<(HEAP32[131282]|0)>>>0){label=24;break}else{$F4_0=$133;$_pre_phi=$132;label=25;break};case 24:_abort();return 0;return 0;case 25:HEAP32[$_pre_phi>>2]=$120;HEAP32[$F4_0+12>>2]=$120;HEAP32[$120+8>>2]=$F4_0;HEAP32[$120+12>>2]=$124;label=26;break;case 26:HEAP32[131280]=$106;HEAP32[131283]=$109+$8;$mem_0=$88;label=341;break;case 27:$145=HEAP32[131279]|0;if(($145|0)==0){$nb_0=$8;label=160;break}else{label=28;break};case 28:$150=($145&-$145)-1|0;$152=$150>>>12&16;$153=$150>>>($152>>>0);$155=$153>>>5&8;$157=$153>>>($155>>>0);$159=$157>>>2&4;$161=$157>>>($159>>>0);$163=$161>>>1&2;$165=$161>>>($163>>>0);$167=$165>>>1&1;$172=HEAP32[525416+(($155|$152|$159|$163|$167)+($165>>>($167>>>0))<<2)>>2]|0;$t_0_i=$172;$v_0_i=$172;$rsize_0_i=(HEAP32[$172+4>>2]&-8)-$8|0;label=29;break;case 29:$179=HEAP32[$t_0_i+16>>2]|0;if(($179|0)==0){label=30;break}else{$185=$179;label=31;break};case 30:$183=HEAP32[$t_0_i+20>>2]|0;if(($183|0)==0){label=32;break}else{$185=$183;label=31;break};case 31:$189=(HEAP32[$185+4>>2]&-8)-$8|0;$190=$189>>>0<$rsize_0_i>>>0;$t_0_i=$185;$v_0_i=$190?$185:$v_0_i;$rsize_0_i=$190?$189:$rsize_0_i;label=29;break;case 32:$192=$v_0_i;$193=HEAP32[131282]|0;if($192>>>0<$193>>>0){label=76;break}else{label=33;break};case 33:$196=$192+$8|0;if($192>>>0<$196>>>0){label=34;break}else{label=76;break};case 34:$201=HEAP32[$v_0_i+24>>2]|0;$203=HEAP32[$v_0_i+12>>2]|0;if(($203|0)==($v_0_i|0)){label=40;break}else{label=35;break};case 35:$207=HEAP32[$v_0_i+8>>2]|0;if($207>>>0<$193>>>0){label=39;break}else{label=36;break};case 36:$211=$207+12|0;if((HEAP32[$211>>2]|0)==($v_0_i|0)){label=37;break}else{label=39;break};case 37:$215=$203+8|0;if((HEAP32[$215>>2]|0)==($v_0_i|0)){label=38;break}else{label=39;break};case 38:HEAP32[$211>>2]=$203;HEAP32[$215>>2]=$207;$R_1_i=$203;label=47;break;case 39:_abort();return 0;return 0;case 40:$220=$v_0_i+20|0;$221=HEAP32[$220>>2]|0;if(($221|0)==0){label=41;break}else{$R_0_i=$221;$RP_0_i=$220;label=42;break};case 41:$224=$v_0_i+16|0;$225=HEAP32[$224>>2]|0;if(($225|0)==0){$R_1_i=0;label=47;break}else{$R_0_i=$225;$RP_0_i=$224;label=42;break};case 42:$227=$R_0_i+20|0;$228=HEAP32[$227>>2]|0;if(($228|0)==0){label=43;break}else{$R_0_i=$228;$RP_0_i=$227;label=42;break};case 43:$231=$R_0_i+16|0;$232=HEAP32[$231>>2]|0;if(($232|0)==0){label=44;break}else{$R_0_i=$232;$RP_0_i=$231;label=42;break};case 44:if($RP_0_i>>>0<$193>>>0){label=46;break}else{label=45;break};case 45:HEAP32[$RP_0_i>>2]=0;$R_1_i=$R_0_i;label=47;break;case 46:_abort();return 0;return 0;case 47:if(($201|0)==0){label=67;break}else{label=48;break};case 48:$242=$v_0_i+28|0;$244=525416+(HEAP32[$242>>2]<<2)|0;if(($v_0_i|0)==(HEAP32[$244>>2]|0)){label=49;break}else{label=51;break};case 49:HEAP32[$244>>2]=$R_1_i;if(($R_1_i|0)==0){label=50;break}else{label=57;break};case 50:HEAP32[131279]=HEAP32[131279]&~(1<<HEAP32[$242>>2]);label=67;break;case 51:if($201>>>0<(HEAP32[131282]|0)>>>0){label=55;break}else{label=52;break};case 52:$258=$201+16|0;if((HEAP32[$258>>2]|0)==($v_0_i|0)){label=53;break}else{label=54;break};case 53:HEAP32[$258>>2]=$R_1_i;label=56;break;case 54:HEAP32[$201+20>>2]=$R_1_i;label=56;break;case 55:_abort();return 0;return 0;case 56:if(($R_1_i|0)==0){label=67;break}else{label=57;break};case 57:if($R_1_i>>>0<(HEAP32[131282]|0)>>>0){label=66;break}else{label=58;break};case 58:HEAP32[$R_1_i+24>>2]=$201;$274=HEAP32[$v_0_i+16>>2]|0;if(($274|0)==0){label=62;break}else{label=59;break};case 59:if($274>>>0<(HEAP32[131282]|0)>>>0){label=61;break}else{label=60;break};case 60:HEAP32[$R_1_i+16>>2]=$274;HEAP32[$274+24>>2]=$R_1_i;label=62;break;case 61:_abort();return 0;return 0;case 62:$286=HEAP32[$v_0_i+20>>2]|0;if(($286|0)==0){label=67;break}else{label=63;break};case 63:if($286>>>0<(HEAP32[131282]|0)>>>0){label=65;break}else{label=64;break};case 64:HEAP32[$R_1_i+20>>2]=$286;HEAP32[$286+24>>2]=$R_1_i;label=67;break;case 65:_abort();return 0;return 0;case 66:_abort();return 0;return 0;case 67:if($rsize_0_i>>>0<16){label=68;break}else{label=69;break};case 68:$300=$rsize_0_i+$8|0;HEAP32[$v_0_i+4>>2]=$300|3;$304=$192+($300+4)|0;HEAP32[$304>>2]=HEAP32[$304>>2]|1;label=77;break;case 69:HEAP32[$v_0_i+4>>2]=$8|3;HEAP32[$192+($8|4)>>2]=$rsize_0_i|1;HEAP32[$192+($rsize_0_i+$8)>>2]=$rsize_0_i;$315=HEAP32[131280]|0;if(($315|0)==0){label=75;break}else{label=70;break};case 70:$318=HEAP32[131283]|0;$319=$315>>>3;$320=$319<<1;$322=525152+($320<<2)|0;$323=HEAP32[131278]|0;$324=1<<$319;if(($323&$324|0)==0){label=71;break}else{label=72;break};case 71:HEAP32[131278]=$323|$324;$F1_0_i=$322;$_pre_phi_i=525152+($320+2<<2)|0;label=74;break;case 72:$330=525152+($320+2<<2)|0;$331=HEAP32[$330>>2]|0;if($331>>>0<(HEAP32[131282]|0)>>>0){label=73;break}else{$F1_0_i=$331;$_pre_phi_i=$330;label=74;break};case 73:_abort();return 0;return 0;case 74:HEAP32[$_pre_phi_i>>2]=$318;HEAP32[$F1_0_i+12>>2]=$318;HEAP32[$318+8>>2]=$F1_0_i;HEAP32[$318+12>>2]=$322;label=75;break;case 75:HEAP32[131280]=$rsize_0_i;HEAP32[131283]=$196;label=77;break;case 76:_abort();return 0;return 0;case 77:$342=$v_0_i+8|0;if(($342|0)==0){$nb_0=$8;label=160;break}else{$mem_0=$342;label=341;break};case 78:if($bytes>>>0>4294967231){$nb_0=-1;label=160;break}else{label=79;break};case 79:$348=$bytes+11|0;$349=$348&-8;$350=HEAP32[131279]|0;if(($350|0)==0){$nb_0=$349;label=160;break}else{label=80;break};case 80:$353=-$349|0;$354=$348>>>8;if(($354|0)==0){$idx_0_i=0;label=83;break}else{label=81;break};case 81:if($349>>>0>16777215){$idx_0_i=31;label=83;break}else{label=82;break};case 82:$361=($354+1048320|0)>>>16&8;$362=$354<<$361;$365=($362+520192|0)>>>16&4;$367=$362<<$365;$370=($367+245760|0)>>>16&2;$375=14-($365|$361|$370)+($367<<$370>>>15)|0;$idx_0_i=$349>>>(($375+7|0)>>>0)&1|$375<<1;label=83;break;case 83:$383=HEAP32[525416+($idx_0_i<<2)>>2]|0;if(($383|0)==0){$v_2_i=0;$rsize_2_i=$353;$t_1_i=0;label=90;break}else{label=84;break};case 84:if(($idx_0_i|0)==31){$391=0;label=86;break}else{label=85;break};case 85:$391=25-($idx_0_i>>>1)|0;label=86;break;case 86:$v_0_i118=0;$rsize_0_i117=$353;$t_0_i116=$383;$sizebits_0_i=$349<<$391;$rst_0_i=0;label=87;break;case 87:$396=HEAP32[$t_0_i116+4>>2]&-8;$397=$396-$349|0;if($397>>>0<$rsize_0_i117>>>0){label=88;break}else{$v_1_i=$v_0_i118;$rsize_1_i=$rsize_0_i117;label=89;break};case 88:if(($396|0)==($349|0)){$v_2_i=$t_0_i116;$rsize_2_i=$397;$t_1_i=$t_0_i116;label=90;break}else{$v_1_i=$t_0_i116;$rsize_1_i=$397;label=89;break};case 89:$403=HEAP32[$t_0_i116+20>>2]|0;$406=HEAP32[$t_0_i116+16+($sizebits_0_i>>>31<<2)>>2]|0;$rst_1_i=($403|0)==0|($403|0)==($406|0)?$rst_0_i:$403;if(($406|0)==0){$v_2_i=$v_1_i;$rsize_2_i=$rsize_1_i;$t_1_i=$rst_1_i;label=90;break}else{$v_0_i118=$v_1_i;$rsize_0_i117=$rsize_1_i;$t_0_i116=$406;$sizebits_0_i=$sizebits_0_i<<1;$rst_0_i=$rst_1_i;label=87;break};case 90:if(($t_1_i|0)==0&($v_2_i|0)==0){label=91;break}else{$t_2_ph_i=$t_1_i;label=93;break};case 91:$414=2<<$idx_0_i;$417=$350&($414|-$414);if(($417|0)==0){$nb_0=$349;label=160;break}else{label=92;break};case 92:$422=($417&-$417)-1|0;$424=$422>>>12&16;$425=$422>>>($424>>>0);$427=$425>>>5&8;$429=$425>>>($427>>>0);$431=$429>>>2&4;$433=$429>>>($431>>>0);$435=$433>>>1&2;$437=$433>>>($435>>>0);$439=$437>>>1&1;$t_2_ph_i=HEAP32[525416+(($427|$424|$431|$435|$439)+($437>>>($439>>>0))<<2)>>2]|0;label=93;break;case 93:if(($t_2_ph_i|0)==0){$rsize_3_lcssa_i=$rsize_2_i;$v_3_lcssa_i=$v_2_i;label=96;break}else{$t_228_i=$t_2_ph_i;$rsize_329_i=$rsize_2_i;$v_330_i=$v_2_i;label=94;break};case 94:$449=(HEAP32[$t_228_i+4>>2]&-8)-$349|0;$450=$449>>>0<$rsize_329_i>>>0;$_rsize_3_i=$450?$449:$rsize_329_i;$t_2_v_3_i=$450?$t_228_i:$v_330_i;$452=HEAP32[$t_228_i+16>>2]|0;if(($452|0)==0){label=95;break}else{$t_228_i=$452;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;label=94;break};case 95:$455=HEAP32[$t_228_i+20>>2]|0;if(($455|0)==0){$rsize_3_lcssa_i=$_rsize_3_i;$v_3_lcssa_i=$t_2_v_3_i;label=96;break}else{$t_228_i=$455;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;label=94;break};case 96:if(($v_3_lcssa_i|0)==0){$nb_0=$349;label=160;break}else{label=97;break};case 97:if($rsize_3_lcssa_i>>>0<((HEAP32[131280]|0)-$349|0)>>>0){label=98;break}else{$nb_0=$349;label=160;break};case 98:$463=$v_3_lcssa_i;$464=HEAP32[131282]|0;if($463>>>0<$464>>>0){label=158;break}else{label=99;break};case 99:$467=$463+$349|0;$468=$467;if($463>>>0<$467>>>0){label=100;break}else{label=158;break};case 100:$472=HEAP32[$v_3_lcssa_i+24>>2]|0;$474=HEAP32[$v_3_lcssa_i+12>>2]|0;if(($474|0)==($v_3_lcssa_i|0)){label=106;break}else{label=101;break};case 101:$478=HEAP32[$v_3_lcssa_i+8>>2]|0;if($478>>>0<$464>>>0){label=105;break}else{label=102;break};case 102:$482=$478+12|0;if((HEAP32[$482>>2]|0)==($v_3_lcssa_i|0)){label=103;break}else{label=105;break};case 103:$486=$474+8|0;if((HEAP32[$486>>2]|0)==($v_3_lcssa_i|0)){label=104;break}else{label=105;break};case 104:HEAP32[$482>>2]=$474;HEAP32[$486>>2]=$478;$R_1_i122=$474;label=113;break;case 105:_abort();return 0;return 0;case 106:$491=$v_3_lcssa_i+20|0;$492=HEAP32[$491>>2]|0;if(($492|0)==0){label=107;break}else{$R_0_i120=$492;$RP_0_i119=$491;label=108;break};case 107:$495=$v_3_lcssa_i+16|0;$496=HEAP32[$495>>2]|0;if(($496|0)==0){$R_1_i122=0;label=113;break}else{$R_0_i120=$496;$RP_0_i119=$495;label=108;break};case 108:$498=$R_0_i120+20|0;$499=HEAP32[$498>>2]|0;if(($499|0)==0){label=109;break}else{$R_0_i120=$499;$RP_0_i119=$498;label=108;break};case 109:$502=$R_0_i120+16|0;$503=HEAP32[$502>>2]|0;if(($503|0)==0){label=110;break}else{$R_0_i120=$503;$RP_0_i119=$502;label=108;break};case 110:if($RP_0_i119>>>0<$464>>>0){label=112;break}else{label=111;break};case 111:HEAP32[$RP_0_i119>>2]=0;$R_1_i122=$R_0_i120;label=113;break;case 112:_abort();return 0;return 0;case 113:if(($472|0)==0){label=133;break}else{label=114;break};case 114:$513=$v_3_lcssa_i+28|0;$515=525416+(HEAP32[$513>>2]<<2)|0;if(($v_3_lcssa_i|0)==(HEAP32[$515>>2]|0)){label=115;break}else{label=117;break};case 115:HEAP32[$515>>2]=$R_1_i122;if(($R_1_i122|0)==0){label=116;break}else{label=123;break};case 116:HEAP32[131279]=HEAP32[131279]&~(1<<HEAP32[$513>>2]);label=133;break;case 117:if($472>>>0<(HEAP32[131282]|0)>>>0){label=121;break}else{label=118;break};case 118:$529=$472+16|0;if((HEAP32[$529>>2]|0)==($v_3_lcssa_i|0)){label=119;break}else{label=120;break};case 119:HEAP32[$529>>2]=$R_1_i122;label=122;break;case 120:HEAP32[$472+20>>2]=$R_1_i122;label=122;break;case 121:_abort();return 0;return 0;case 122:if(($R_1_i122|0)==0){label=133;break}else{label=123;break};case 123:if($R_1_i122>>>0<(HEAP32[131282]|0)>>>0){label=132;break}else{label=124;break};case 124:HEAP32[$R_1_i122+24>>2]=$472;$545=HEAP32[$v_3_lcssa_i+16>>2]|0;if(($545|0)==0){label=128;break}else{label=125;break};case 125:if($545>>>0<(HEAP32[131282]|0)>>>0){label=127;break}else{label=126;break};case 126:HEAP32[$R_1_i122+16>>2]=$545;HEAP32[$545+24>>2]=$R_1_i122;label=128;break;case 127:_abort();return 0;return 0;case 128:$557=HEAP32[$v_3_lcssa_i+20>>2]|0;if(($557|0)==0){label=133;break}else{label=129;break};case 129:if($557>>>0<(HEAP32[131282]|0)>>>0){label=131;break}else{label=130;break};case 130:HEAP32[$R_1_i122+20>>2]=$557;HEAP32[$557+24>>2]=$R_1_i122;label=133;break;case 131:_abort();return 0;return 0;case 132:_abort();return 0;return 0;case 133:if($rsize_3_lcssa_i>>>0<16){label=134;break}else{label=135;break};case 134:$571=$rsize_3_lcssa_i+$349|0;HEAP32[$v_3_lcssa_i+4>>2]=$571|3;$575=$463+($571+4)|0;HEAP32[$575>>2]=HEAP32[$575>>2]|1;label=159;break;case 135:HEAP32[$v_3_lcssa_i+4>>2]=$349|3;HEAP32[$463+($349|4)>>2]=$rsize_3_lcssa_i|1;HEAP32[$463+($rsize_3_lcssa_i+$349)>>2]=$rsize_3_lcssa_i;$586=$rsize_3_lcssa_i>>>3;if($rsize_3_lcssa_i>>>0<256){label=136;break}else{label=141;break};case 136:$589=$586<<1;$591=525152+($589<<2)|0;$592=HEAP32[131278]|0;$593=1<<$586;if(($592&$593|0)==0){label=137;break}else{label=138;break};case 137:HEAP32[131278]=$592|$593;$F5_0_i=$591;$_pre_phi_i128=525152+($589+2<<2)|0;label=140;break;case 138:$599=525152+($589+2<<2)|0;$600=HEAP32[$599>>2]|0;if($600>>>0<(HEAP32[131282]|0)>>>0){label=139;break}else{$F5_0_i=$600;$_pre_phi_i128=$599;label=140;break};case 139:_abort();return 0;return 0;case 140:HEAP32[$_pre_phi_i128>>2]=$468;HEAP32[$F5_0_i+12>>2]=$468;HEAP32[$463+($349+8)>>2]=$F5_0_i;HEAP32[$463+($349+12)>>2]=$591;label=159;break;case 141:$612=$467;$613=$rsize_3_lcssa_i>>>8;if(($613|0)==0){$I7_0_i=0;label=144;break}else{label=142;break};case 142:if($rsize_3_lcssa_i>>>0>16777215){$I7_0_i=31;label=144;break}else{label=143;break};case 143:$620=($613+1048320|0)>>>16&8;$621=$613<<$620;$624=($621+520192|0)>>>16&4;$626=$621<<$624;$629=($626+245760|0)>>>16&2;$634=14-($624|$620|$629)+($626<<$629>>>15)|0;$I7_0_i=$rsize_3_lcssa_i>>>(($634+7|0)>>>0)&1|$634<<1;label=144;break;case 144:$641=525416+($I7_0_i<<2)|0;HEAP32[$463+($349+28)>>2]=$I7_0_i;HEAP32[$463+($349+20)>>2]=0;HEAP32[$463+($349+16)>>2]=0;$648=HEAP32[131279]|0;$649=1<<$I7_0_i;if(($648&$649|0)==0){label=145;break}else{label=146;break};case 145:HEAP32[131279]=$648|$649;HEAP32[$641>>2]=$612;HEAP32[$463+($349+24)>>2]=$641;HEAP32[$463+($349+12)>>2]=$612;HEAP32[$463+($349+8)>>2]=$612;label=159;break;case 146:if(($I7_0_i|0)==31){$668=0;label=148;break}else{label=147;break};case 147:$668=25-($I7_0_i>>>1)|0;label=148;break;case 148:$K12_0_i=$rsize_3_lcssa_i<<$668;$T_0_i=HEAP32[$641>>2]|0;label=149;break;case 149:if((HEAP32[$T_0_i+4>>2]&-8|0)==($rsize_3_lcssa_i|0)){label=154;break}else{label=150;break};case 150:$677=$T_0_i+16+($K12_0_i>>>31<<2)|0;$678=HEAP32[$677>>2]|0;if(($678|0)==0){label=151;break}else{$K12_0_i=$K12_0_i<<1;$T_0_i=$678;label=149;break};case 151:if($677>>>0<(HEAP32[131282]|0)>>>0){label=153;break}else{label=152;break};case 152:HEAP32[$677>>2]=$612;HEAP32[$463+($349+24)>>2]=$T_0_i;HEAP32[$463+($349+12)>>2]=$612;HEAP32[$463+($349+8)>>2]=$612;label=159;break;case 153:_abort();return 0;return 0;case 154:$694=$T_0_i+8|0;$695=HEAP32[$694>>2]|0;$697=HEAP32[131282]|0;if($T_0_i>>>0<$697>>>0){label=157;break}else{label=155;break};case 155:if($695>>>0<$697>>>0){label=157;break}else{label=156;break};case 156:HEAP32[$695+12>>2]=$612;HEAP32[$694>>2]=$612;HEAP32[$463+($349+8)>>2]=$695;HEAP32[$463+($349+12)>>2]=$T_0_i;HEAP32[$463+($349+24)>>2]=0;label=159;break;case 157:_abort();return 0;return 0;case 158:_abort();return 0;return 0;case 159:$711=$v_3_lcssa_i+8|0;if(($711|0)==0){$nb_0=$349;label=160;break}else{$mem_0=$711;label=341;break};case 160:$714=HEAP32[131280]|0;if($nb_0>>>0>$714>>>0){label=165;break}else{label=161;break};case 161:$717=$714-$nb_0|0;$718=HEAP32[131283]|0;if($717>>>0>15){label=162;break}else{label=163;break};case 162:$721=$718;HEAP32[131283]=$721+$nb_0;HEAP32[131280]=$717;HEAP32[$721+($nb_0+4)>>2]=$717|1;HEAP32[$721+$714>>2]=$717;HEAP32[$718+4>>2]=$nb_0|3;label=164;break;case 163:HEAP32[131280]=0;HEAP32[131283]=0;HEAP32[$718+4>>2]=$714|3;$736=$718+($714+4)|0;HEAP32[$736>>2]=HEAP32[$736>>2]|1;label=164;break;case 164:$mem_0=$718+8|0;label=341;break;case 165:$743=HEAP32[131281]|0;if($nb_0>>>0<$743>>>0){label=166;break}else{label=167;break};case 166:$746=$743-$nb_0|0;HEAP32[131281]=$746;$747=HEAP32[131284]|0;$748=$747;HEAP32[131284]=$748+$nb_0;HEAP32[$748+($nb_0+4)>>2]=$746|1;HEAP32[$747+4>>2]=$nb_0|3;$mem_0=$747+8|0;label=341;break;case 167:if((HEAP32[131268]|0)==0){label=168;break}else{label=171;break};case 168:$762=_sysconf(8)|0;if(($762-1&$762|0)==0){label=170;break}else{label=169;break};case 169:_abort();return 0;return 0;case 170:HEAP32[131270]=$762;HEAP32[131269]=$762;HEAP32[131271]=-1;HEAP32[131272]=-1;HEAP32[131273]=0;HEAP32[131389]=0;HEAP32[131268]=(_time(0)|0)&-16^1431655768;label=171;break;case 171:$772=HEAP32[131270]|0;$773=$nb_0+47|0;$774=$772+$773|0;$775=-$772|0;$776=$774&$775;if($776>>>0>$nb_0>>>0){label=172;break}else{$mem_0=0;label=341;break};case 172:$779=HEAP32[131388]|0;if(($779|0)==0){label=174;break}else{label=173;break};case 173:$782=HEAP32[131386]|0;$783=$782+$776|0;if($783>>>0<=$782>>>0|$783>>>0>$779>>>0){$mem_0=0;label=341;break}else{label=174;break};case 174:if((HEAP32[131389]&4|0)==0){label=175;break}else{$tsize_1_i=0;label=198;break};case 175:$791=HEAP32[131284]|0;if(($791|0)==0){label=181;break}else{label=176;break};case 176:$794=$791;$sp_0_i_i=525560;label=177;break;case 177:$796=$sp_0_i_i|0;$797=HEAP32[$796>>2]|0;if($797>>>0>$794>>>0){label=179;break}else{label=178;break};case 178:$800=$sp_0_i_i+4|0;if(($797+(HEAP32[$800>>2]|0)|0)>>>0>$794>>>0){label=180;break}else{label=179;break};case 179:$806=HEAP32[$sp_0_i_i+8>>2]|0;if(($806|0)==0){label=181;break}else{$sp_0_i_i=$806;label=177;break};case 180:if(($sp_0_i_i|0)==0){label=181;break}else{label=188;break};case 181:$809=_sbrk(0)|0;if(($809|0)==-1){$tsize_0303639_i=0;label=197;break}else{label=182;break};case 182:$812=$809;$813=HEAP32[131269]|0;$814=$813-1|0;if(($814&$812|0)==0){$ssize_0_i=$776;label=184;break}else{label=183;break};case 183:$ssize_0_i=$776-$812+($814+$812&-$813)|0;label=184;break;case 184:$824=HEAP32[131386]|0;$825=$824+$ssize_0_i|0;if($ssize_0_i>>>0>$nb_0>>>0&$ssize_0_i>>>0<2147483647){label=185;break}else{$tsize_0303639_i=0;label=197;break};case 185:$829=HEAP32[131388]|0;if(($829|0)==0){label=187;break}else{label=186;break};case 186:if($825>>>0<=$824>>>0|$825>>>0>$829>>>0){$tsize_0303639_i=0;label=197;break}else{label=187;break};case 187:$835=_sbrk($ssize_0_i|0)|0;$836=($835|0)==($809|0);$tbase_0_i=$836?$809:-1;$tsize_0_i=$836?$ssize_0_i:0;$br_0_i=$835;$ssize_1_i=$ssize_0_i;label=190;break;case 188:$840=$774-(HEAP32[131281]|0)&$775;if($840>>>0<2147483647){label=189;break}else{$tsize_0303639_i=0;label=197;break};case 189:$843=_sbrk($840|0)|0;$847=($843|0)==((HEAP32[$796>>2]|0)+(HEAP32[$800>>2]|0)|0);$tbase_0_i=$847?$843:-1;$tsize_0_i=$847?$840:0;$br_0_i=$843;$ssize_1_i=$840;label=190;break;case 190:if(($tbase_0_i|0)==-1){label=191;break}else{$tsize_244_i=$tsize_0_i;$tbase_245_i=$tbase_0_i;label=201;break};case 191:if(($br_0_i|0)!=-1&$ssize_1_i>>>0<2147483647&$ssize_1_i>>>0<($nb_0+48|0)>>>0){label=192;break}else{$ssize_2_i=$ssize_1_i;label=196;break};case 192:$856=HEAP32[131270]|0;$860=$773-$ssize_1_i+$856&-$856;if($860>>>0<2147483647){label=193;break}else{$ssize_2_i=$ssize_1_i;label=196;break};case 193:if((_sbrk($860|0)|0)==-1){label=195;break}else{label=194;break};case 194:$ssize_2_i=$860+$ssize_1_i|0;label=196;break;case 195:_sbrk(-$ssize_1_i|0)|0;$tsize_0303639_i=$tsize_0_i;label=197;break;case 196:if(($br_0_i|0)==-1){$tsize_0303639_i=$tsize_0_i;label=197;break}else{$tsize_244_i=$ssize_2_i;$tbase_245_i=$br_0_i;label=201;break};case 197:HEAP32[131389]=HEAP32[131389]|4;$tsize_1_i=$tsize_0303639_i;label=198;break;case 198:if($776>>>0<2147483647){label=199;break}else{label=340;break};case 199:$876=_sbrk($776|0)|0;$877=_sbrk(0)|0;if(($877|0)!=-1&($876|0)!=-1&$876>>>0<$877>>>0){label=200;break}else{label=340;break};case 200:$881=$877-$876|0;$883=$881>>>0>($nb_0+40|0)>>>0;$_tbase_1_i=$883?$876:-1;if(($_tbase_1_i|0)==-1){label=340;break}else{$tsize_244_i=$883?$881:$tsize_1_i;$tbase_245_i=$_tbase_1_i;label=201;break};case 201:$886=(HEAP32[131386]|0)+$tsize_244_i|0;HEAP32[131386]=$886;if($886>>>0>(HEAP32[131387]|0)>>>0){label=202;break}else{label=203;break};case 202:HEAP32[131387]=$886;label=203;break;case 203:$890=HEAP32[131284]|0;if(($890|0)==0){label=204;break}else{$sp_067_i=525560;label=211;break};case 204:$893=HEAP32[131282]|0;if(($893|0)==0|$tbase_245_i>>>0<$893>>>0){label=205;break}else{label=206;break};case 205:HEAP32[131282]=$tbase_245_i;label=206;break;case 206:HEAP32[131390]=$tbase_245_i;HEAP32[131391]=$tsize_244_i;HEAP32[131393]=0;HEAP32[131287]=HEAP32[131268];HEAP32[131286]=-1;$i_02_i_i=0;label=207;break;case 207:$899=$i_02_i_i<<1;$901=525152+($899<<2)|0;HEAP32[525152+($899+3<<2)>>2]=$901;HEAP32[525152+($899+2<<2)>>2]=$901;$904=$i_02_i_i+1|0;if($904>>>0<32){$i_02_i_i=$904;label=207;break}else{label=208;break};case 208:$908=$tbase_245_i+8|0;if(($908&7|0)==0){$914=0;label=210;break}else{label=209;break};case 209:$914=-$908&7;label=210;break;case 210:$917=$tsize_244_i-40-$914|0;HEAP32[131284]=$tbase_245_i+$914;HEAP32[131281]=$917;HEAP32[$tbase_245_i+($914+4)>>2]=$917|1;HEAP32[$tbase_245_i+($tsize_244_i-36)>>2]=40;HEAP32[131285]=HEAP32[131272];label=338;break;case 211:$925=HEAP32[$sp_067_i>>2]|0;$926=$sp_067_i+4|0;$927=HEAP32[$926>>2]|0;if(($tbase_245_i|0)==($925+$927|0)){label=213;break}else{label=212;break};case 212:$932=HEAP32[$sp_067_i+8>>2]|0;if(($932|0)==0){label=218;break}else{$sp_067_i=$932;label=211;break};case 213:if((HEAP32[$sp_067_i+12>>2]&8|0)==0){label=214;break}else{label=218;break};case 214:$939=$890;if($939>>>0>=$925>>>0&$939>>>0<$tbase_245_i>>>0){label=215;break}else{label=218;break};case 215:HEAP32[$926>>2]=$927+$tsize_244_i;$944=HEAP32[131284]|0;$946=(HEAP32[131281]|0)+$tsize_244_i|0;$947=$944;$949=$944+8|0;if(($949&7|0)==0){$955=0;label=217;break}else{label=216;break};case 216:$955=-$949&7;label=217;break;case 217:$958=$946-$955|0;HEAP32[131284]=$947+$955;HEAP32[131281]=$958;HEAP32[$947+($955+4)>>2]=$958|1;HEAP32[$947+($946+4)>>2]=40;HEAP32[131285]=HEAP32[131272];label=338;break;case 218:if($tbase_245_i>>>0<(HEAP32[131282]|0)>>>0){label=219;break}else{label=220;break};case 219:HEAP32[131282]=$tbase_245_i;label=220;break;case 220:$sp_160_i=525560;label=221;break;case 221:$970=$sp_160_i|0;if((HEAP32[$970>>2]|0)==($tbase_245_i+$tsize_244_i|0)){label=223;break}else{label=222;break};case 222:$975=HEAP32[$sp_160_i+8>>2]|0;if(($975|0)==0){label=304;break}else{$sp_160_i=$975;label=221;break};case 223:if((HEAP32[$sp_160_i+12>>2]&8|0)==0){label=224;break}else{label=304;break};case 224:HEAP32[$970>>2]=$tbase_245_i;$982=$sp_160_i+4|0;HEAP32[$982>>2]=(HEAP32[$982>>2]|0)+$tsize_244_i;$986=$tbase_245_i+8|0;if(($986&7|0)==0){$993=0;label=226;break}else{label=225;break};case 225:$993=-$986&7;label=226;break;case 226:$996=$tbase_245_i+($tsize_244_i+8)|0;if(($996&7|0)==0){$1003=0;label=228;break}else{label=227;break};case 227:$1003=-$996&7;label=228;break;case 228:$1004=$tbase_245_i+($1003+$tsize_244_i)|0;$1005=$1004;$_sum_i21_i=$993+$nb_0|0;$1009=$tbase_245_i+$_sum_i21_i|0;$1010=$1009;$1011=$1004-($tbase_245_i+$993)-$nb_0|0;HEAP32[$tbase_245_i+($993+4)>>2]=$nb_0|3;if(($1005|0)==(HEAP32[131284]|0)){label=229;break}else{label=230;break};case 229:$1019=(HEAP32[131281]|0)+$1011|0;HEAP32[131281]=$1019;HEAP32[131284]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$1019|1;label=303;break;case 230:if(($1005|0)==(HEAP32[131283]|0)){label=231;break}else{label=232;break};case 231:$1028=(HEAP32[131280]|0)+$1011|0;HEAP32[131280]=$1028;HEAP32[131283]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$1028|1;HEAP32[$tbase_245_i+($1028+$_sum_i21_i)>>2]=$1028;label=303;break;case 232:$_sum2_i23_i=$tsize_244_i+4|0;$1037=HEAP32[$tbase_245_i+($_sum2_i23_i+$1003)>>2]|0;if(($1037&3|0)==1){label=233;break}else{$oldfirst_0_i_i=$1005;$qsize_0_i_i=$1011;label=280;break};case 233:$1041=$1037&-8;$1042=$1037>>>3;if($1037>>>0<256){label=234;break}else{label=246;break};case 234:$1047=HEAP32[$tbase_245_i+(($1003|8)+$tsize_244_i)>>2]|0;$1050=HEAP32[$tbase_245_i+($tsize_244_i+12+$1003)>>2]|0;$1053=525152+($1042<<1<<2)|0;if(($1047|0)==($1053|0)){label=237;break}else{label=235;break};case 235:if($1047>>>0<(HEAP32[131282]|0)>>>0){label=245;break}else{label=236;break};case 236:if((HEAP32[$1047+12>>2]|0)==($1005|0)){label=237;break}else{label=245;break};case 237:if(($1050|0)==($1047|0)){label=238;break}else{label=239;break};case 238:HEAP32[131278]=HEAP32[131278]&~(1<<$1042);label=279;break;case 239:if(($1050|0)==($1053|0)){label=240;break}else{label=241;break};case 240:$_pre_phi57_i_i=$1050+8|0;label=243;break;case 241:if($1050>>>0<(HEAP32[131282]|0)>>>0){label=244;break}else{label=242;break};case 242:$1076=$1050+8|0;if((HEAP32[$1076>>2]|0)==($1005|0)){$_pre_phi57_i_i=$1076;label=243;break}else{label=244;break};case 243:HEAP32[$1047+12>>2]=$1050;HEAP32[$_pre_phi57_i_i>>2]=$1047;label=279;break;case 244:_abort();return 0;return 0;case 245:_abort();return 0;return 0;case 246:$1081=$1004;$1084=HEAP32[$tbase_245_i+(($1003|24)+$tsize_244_i)>>2]|0;$1087=HEAP32[$tbase_245_i+($tsize_244_i+12+$1003)>>2]|0;if(($1087|0)==($1081|0)){label=252;break}else{label=247;break};case 247:$1092=HEAP32[$tbase_245_i+(($1003|8)+$tsize_244_i)>>2]|0;if($1092>>>0<(HEAP32[131282]|0)>>>0){label=251;break}else{label=248;break};case 248:$1097=$1092+12|0;if((HEAP32[$1097>>2]|0)==($1081|0)){label=249;break}else{label=251;break};case 249:$1101=$1087+8|0;if((HEAP32[$1101>>2]|0)==($1081|0)){label=250;break}else{label=251;break};case 250:HEAP32[$1097>>2]=$1087;HEAP32[$1101>>2]=$1092;$R_1_i_i=$1087;label=259;break;case 251:_abort();return 0;return 0;case 252:$_sum67_i_i=$1003|16;$1107=$tbase_245_i+($_sum2_i23_i+$_sum67_i_i)|0;$1108=HEAP32[$1107>>2]|0;if(($1108|0)==0){label=253;break}else{$R_0_i_i=$1108;$RP_0_i_i=$1107;label=254;break};case 253:$1112=$tbase_245_i+($_sum67_i_i+$tsize_244_i)|0;$1113=HEAP32[$1112>>2]|0;if(($1113|0)==0){$R_1_i_i=0;label=259;break}else{$R_0_i_i=$1113;$RP_0_i_i=$1112;label=254;break};case 254:$1115=$R_0_i_i+20|0;$1116=HEAP32[$1115>>2]|0;if(($1116|0)==0){label=255;break}else{$R_0_i_i=$1116;$RP_0_i_i=$1115;label=254;break};case 255:$1119=$R_0_i_i+16|0;$1120=HEAP32[$1119>>2]|0;if(($1120|0)==0){label=256;break}else{$R_0_i_i=$1120;$RP_0_i_i=$1119;label=254;break};case 256:if($RP_0_i_i>>>0<(HEAP32[131282]|0)>>>0){label=258;break}else{label=257;break};case 257:HEAP32[$RP_0_i_i>>2]=0;$R_1_i_i=$R_0_i_i;label=259;break;case 258:_abort();return 0;return 0;case 259:if(($1084|0)==0){label=279;break}else{label=260;break};case 260:$1132=$tbase_245_i+($tsize_244_i+28+$1003)|0;$1134=525416+(HEAP32[$1132>>2]<<2)|0;if(($1081|0)==(HEAP32[$1134>>2]|0)){label=261;break}else{label=263;break};case 261:HEAP32[$1134>>2]=$R_1_i_i;if(($R_1_i_i|0)==0){label=262;break}else{label=269;break};case 262:HEAP32[131279]=HEAP32[131279]&~(1<<HEAP32[$1132>>2]);label=279;break;case 263:if($1084>>>0<(HEAP32[131282]|0)>>>0){label=267;break}else{label=264;break};case 264:$1148=$1084+16|0;if((HEAP32[$1148>>2]|0)==($1081|0)){label=265;break}else{label=266;break};case 265:HEAP32[$1148>>2]=$R_1_i_i;label=268;break;case 266:HEAP32[$1084+20>>2]=$R_1_i_i;label=268;break;case 267:_abort();return 0;return 0;case 268:if(($R_1_i_i|0)==0){label=279;break}else{label=269;break};case 269:if($R_1_i_i>>>0<(HEAP32[131282]|0)>>>0){label=278;break}else{label=270;break};case 270:HEAP32[$R_1_i_i+24>>2]=$1084;$_sum3233_i_i=$1003|16;$1165=HEAP32[$tbase_245_i+($_sum3233_i_i+$tsize_244_i)>>2]|0;if(($1165|0)==0){label=274;break}else{label=271;break};case 271:if($1165>>>0<(HEAP32[131282]|0)>>>0){label=273;break}else{label=272;break};case 272:HEAP32[$R_1_i_i+16>>2]=$1165;HEAP32[$1165+24>>2]=$R_1_i_i;label=274;break;case 273:_abort();return 0;return 0;case 274:$1178=HEAP32[$tbase_245_i+($_sum2_i23_i+$_sum3233_i_i)>>2]|0;if(($1178|0)==0){label=279;break}else{label=275;break};case 275:if($1178>>>0<(HEAP32[131282]|0)>>>0){label=277;break}else{label=276;break};case 276:HEAP32[$R_1_i_i+20>>2]=$1178;HEAP32[$1178+24>>2]=$R_1_i_i;label=279;break;case 277:_abort();return 0;return 0;case 278:_abort();return 0;return 0;case 279:$oldfirst_0_i_i=$tbase_245_i+(($1041|$1003)+$tsize_244_i)|0;$qsize_0_i_i=$1041+$1011|0;label=280;break;case 280:$1194=$oldfirst_0_i_i+4|0;HEAP32[$1194>>2]=HEAP32[$1194>>2]&-2;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$qsize_0_i_i|1;HEAP32[$tbase_245_i+($qsize_0_i_i+$_sum_i21_i)>>2]=$qsize_0_i_i;$1202=$qsize_0_i_i>>>3;if($qsize_0_i_i>>>0<256){label=281;break}else{label=286;break};case 281:$1205=$1202<<1;$1207=525152+($1205<<2)|0;$1208=HEAP32[131278]|0;$1209=1<<$1202;if(($1208&$1209|0)==0){label=282;break}else{label=283;break};case 282:HEAP32[131278]=$1208|$1209;$F4_0_i_i=$1207;$_pre_phi_i25_i=525152+($1205+2<<2)|0;label=285;break;case 283:$1215=525152+($1205+2<<2)|0;$1216=HEAP32[$1215>>2]|0;if($1216>>>0<(HEAP32[131282]|0)>>>0){label=284;break}else{$F4_0_i_i=$1216;$_pre_phi_i25_i=$1215;label=285;break};case 284:_abort();return 0;return 0;case 285:HEAP32[$_pre_phi_i25_i>>2]=$1010;HEAP32[$F4_0_i_i+12>>2]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$F4_0_i_i;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1207;label=303;break;case 286:$1228=$1009;$1229=$qsize_0_i_i>>>8;if(($1229|0)==0){$I7_0_i_i=0;label=289;break}else{label=287;break};case 287:if($qsize_0_i_i>>>0>16777215){$I7_0_i_i=31;label=289;break}else{label=288;break};case 288:$1236=($1229+1048320|0)>>>16&8;$1237=$1229<<$1236;$1240=($1237+520192|0)>>>16&4;$1242=$1237<<$1240;$1245=($1242+245760|0)>>>16&2;$1250=14-($1240|$1236|$1245)+($1242<<$1245>>>15)|0;$I7_0_i_i=$qsize_0_i_i>>>(($1250+7|0)>>>0)&1|$1250<<1;label=289;break;case 289:$1257=525416+($I7_0_i_i<<2)|0;HEAP32[$tbase_245_i+($_sum_i21_i+28)>>2]=$I7_0_i_i;HEAP32[$tbase_245_i+($_sum_i21_i+20)>>2]=0;HEAP32[$tbase_245_i+($_sum_i21_i+16)>>2]=0;$1264=HEAP32[131279]|0;$1265=1<<$I7_0_i_i;if(($1264&$1265|0)==0){label=290;break}else{label=291;break};case 290:HEAP32[131279]=$1264|$1265;HEAP32[$1257>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=$1257;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1228;label=303;break;case 291:if(($I7_0_i_i|0)==31){$1284=0;label=293;break}else{label=292;break};case 292:$1284=25-($I7_0_i_i>>>1)|0;label=293;break;case 293:$K8_0_i_i=$qsize_0_i_i<<$1284;$T_0_i27_i=HEAP32[$1257>>2]|0;label=294;break;case 294:if((HEAP32[$T_0_i27_i+4>>2]&-8|0)==($qsize_0_i_i|0)){label=299;break}else{label=295;break};case 295:$1293=$T_0_i27_i+16+($K8_0_i_i>>>31<<2)|0;$1294=HEAP32[$1293>>2]|0;if(($1294|0)==0){label=296;break}else{$K8_0_i_i=$K8_0_i_i<<1;$T_0_i27_i=$1294;label=294;break};case 296:if($1293>>>0<(HEAP32[131282]|0)>>>0){label=298;break}else{label=297;break};case 297:HEAP32[$1293>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=$T_0_i27_i;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1228;label=303;break;case 298:_abort();return 0;return 0;case 299:$1310=$T_0_i27_i+8|0;$1311=HEAP32[$1310>>2]|0;$1313=HEAP32[131282]|0;if($T_0_i27_i>>>0<$1313>>>0){label=302;break}else{label=300;break};case 300:if($1311>>>0<$1313>>>0){label=302;break}else{label=301;break};case 301:HEAP32[$1311+12>>2]=$1228;HEAP32[$1310>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1311;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$T_0_i27_i;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=0;label=303;break;case 302:_abort();return 0;return 0;case 303:$mem_0=$tbase_245_i+($993|8)|0;label=341;break;case 304:$1327=$890;$sp_0_i_i_i=525560;label=305;break;case 305:$1330=HEAP32[$sp_0_i_i_i>>2]|0;if($1330>>>0>$1327>>>0){label=307;break}else{label=306;break};case 306:$1334=HEAP32[$sp_0_i_i_i+4>>2]|0;$1335=$1330+$1334|0;if($1335>>>0>$1327>>>0){label=308;break}else{label=307;break};case 307:$sp_0_i_i_i=HEAP32[$sp_0_i_i_i+8>>2]|0;label=305;break;case 308:$1341=$1330+($1334-39)|0;if(($1341&7|0)==0){$1348=0;label=310;break}else{label=309;break};case 309:$1348=-$1341&7;label=310;break;case 310:$1349=$1330+($1334-47+$1348)|0;$1353=$1349>>>0<($890+16|0)>>>0?$1327:$1349;$1354=$1353+8|0;$1358=$tbase_245_i+8|0;if(($1358&7|0)==0){$1364=0;label=312;break}else{label=311;break};case 311:$1364=-$1358&7;label=312;break;case 312:$1367=$tsize_244_i-40-$1364|0;HEAP32[131284]=$tbase_245_i+$1364;HEAP32[131281]=$1367;HEAP32[$tbase_245_i+($1364+4)>>2]=$1367|1;HEAP32[$tbase_245_i+($tsize_244_i-36)>>2]=40;HEAP32[131285]=HEAP32[131272];HEAP32[$1353+4>>2]=27;HEAP32[$1354>>2]=HEAP32[131390];HEAP32[$1354+4>>2]=HEAP32[525564>>2];HEAP32[$1354+8>>2]=HEAP32[525568>>2];HEAP32[$1354+12>>2]=HEAP32[525572>>2];HEAP32[131390]=$tbase_245_i;HEAP32[131391]=$tsize_244_i;HEAP32[131393]=0;HEAP32[131392]=$1354;$1377=$1353+28|0;HEAP32[$1377>>2]=7;if(($1353+32|0)>>>0<$1335>>>0){$1380=$1377;label=313;break}else{label=314;break};case 313:$1381=$1380+4|0;HEAP32[$1381>>2]=7;if(($1380+8|0)>>>0<$1335>>>0){$1380=$1381;label=313;break}else{label=314;break};case 314:if(($1353|0)==($1327|0)){label=338;break}else{label=315;break};case 315:$1389=$1353-$890|0;$1392=$1327+($1389+4)|0;HEAP32[$1392>>2]=HEAP32[$1392>>2]&-2;HEAP32[$890+4>>2]=$1389|1;HEAP32[$1327+$1389>>2]=$1389;$1398=$1389>>>3;if($1389>>>0<256){label=316;break}else{label=321;break};case 316:$1401=$1398<<1;$1403=525152+($1401<<2)|0;$1404=HEAP32[131278]|0;$1405=1<<$1398;if(($1404&$1405|0)==0){label=317;break}else{label=318;break};case 317:HEAP32[131278]=$1404|$1405;$F_0_i_i=$1403;$_pre_phi_i_i=525152+($1401+2<<2)|0;label=320;break;case 318:$1411=525152+($1401+2<<2)|0;$1412=HEAP32[$1411>>2]|0;if($1412>>>0<(HEAP32[131282]|0)>>>0){label=319;break}else{$F_0_i_i=$1412;$_pre_phi_i_i=$1411;label=320;break};case 319:_abort();return 0;return 0;case 320:HEAP32[$_pre_phi_i_i>>2]=$890;HEAP32[$F_0_i_i+12>>2]=$890;HEAP32[$890+8>>2]=$F_0_i_i;HEAP32[$890+12>>2]=$1403;label=338;break;case 321:$1422=$890;$1423=$1389>>>8;if(($1423|0)==0){$I1_0_i_i=0;label=324;break}else{label=322;break};case 322:if($1389>>>0>16777215){$I1_0_i_i=31;label=324;break}else{label=323;break};case 323:$1430=($1423+1048320|0)>>>16&8;$1431=$1423<<$1430;$1434=($1431+520192|0)>>>16&4;$1436=$1431<<$1434;$1439=($1436+245760|0)>>>16&2;$1444=14-($1434|$1430|$1439)+($1436<<$1439>>>15)|0;$I1_0_i_i=$1389>>>(($1444+7|0)>>>0)&1|$1444<<1;label=324;break;case 324:$1451=525416+($I1_0_i_i<<2)|0;HEAP32[$890+28>>2]=$I1_0_i_i;HEAP32[$890+20>>2]=0;HEAP32[$890+16>>2]=0;$1455=HEAP32[131279]|0;$1456=1<<$I1_0_i_i;if(($1455&$1456|0)==0){label=325;break}else{label=326;break};case 325:HEAP32[131279]=$1455|$1456;HEAP32[$1451>>2]=$1422;HEAP32[$890+24>>2]=$1451;HEAP32[$890+12>>2]=$890;HEAP32[$890+8>>2]=$890;label=338;break;case 326:if(($I1_0_i_i|0)==31){$1471=0;label=328;break}else{label=327;break};case 327:$1471=25-($I1_0_i_i>>>1)|0;label=328;break;case 328:$K2_0_i_i=$1389<<$1471;$T_0_i_i=HEAP32[$1451>>2]|0;label=329;break;case 329:if((HEAP32[$T_0_i_i+4>>2]&-8|0)==($1389|0)){label=334;break}else{label=330;break};case 330:$1480=$T_0_i_i+16+($K2_0_i_i>>>31<<2)|0;$1481=HEAP32[$1480>>2]|0;if(($1481|0)==0){label=331;break}else{$K2_0_i_i=$K2_0_i_i<<1;$T_0_i_i=$1481;label=329;break};case 331:if($1480>>>0<(HEAP32[131282]|0)>>>0){label=333;break}else{label=332;break};case 332:HEAP32[$1480>>2]=$1422;HEAP32[$890+24>>2]=$T_0_i_i;HEAP32[$890+12>>2]=$890;HEAP32[$890+8>>2]=$890;label=338;break;case 333:_abort();return 0;return 0;case 334:$1494=$T_0_i_i+8|0;$1495=HEAP32[$1494>>2]|0;$1497=HEAP32[131282]|0;if($T_0_i_i>>>0<$1497>>>0){label=337;break}else{label=335;break};case 335:if($1495>>>0<$1497>>>0){label=337;break}else{label=336;break};case 336:HEAP32[$1495+12>>2]=$1422;HEAP32[$1494>>2]=$1422;HEAP32[$890+8>>2]=$1495;HEAP32[$890+12>>2]=$T_0_i_i;HEAP32[$890+24>>2]=0;label=338;break;case 337:_abort();return 0;return 0;case 338:$1507=HEAP32[131281]|0;if($1507>>>0>$nb_0>>>0){label=339;break}else{label=340;break};case 339:$1510=$1507-$nb_0|0;HEAP32[131281]=$1510;$1511=HEAP32[131284]|0;$1512=$1511;HEAP32[131284]=$1512+$nb_0;HEAP32[$1512+($nb_0+4)>>2]=$1510|1;HEAP32[$1511+4>>2]=$nb_0|3;$mem_0=$1511+8|0;label=341;break;case 340:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=341;break;case 341:return $mem_0|0}return 0}function _free($mem){$mem=$mem|0;var $3=0,$5=0,$10=0,$11=0,$14=0,$15=0,$16=0,$21=0,$_sum232=0,$24=0,$25=0,$26=0,$32=0,$37=0,$40=0,$43=0,$64=0,$_pre_phi306=0,$69=0,$72=0,$75=0,$80=0,$84=0,$88=0,$94=0,$95=0,$99=0,$100=0,$RP_0=0,$R_0=0,$102=0,$103=0,$106=0,$107=0,$R_1=0,$118=0,$120=0,$134=0,$151=0,$164=0,$177=0,$psize_0=0,$p_0=0,$189=0,$193=0,$194=0,$204=0,$215=0,$222=0,$223=0,$228=0,$231=0,$234=0,$257=0,$_pre_phi304=0,$262=0,$265=0,$268=0,$273=0,$278=0,$282=0,$288=0,$289=0,$293=0,$294=0,$RP9_0=0,$R7_0=0,$296=0,$297=0,$300=0,$301=0,$R7_1=0,$313=0,$315=0,$329=0,$346=0,$359=0,$psize_1=0,$385=0,$388=0,$390=0,$391=0,$392=0,$398=0,$399=0,$_pre_phi=0,$F16_0=0,$409=0,$410=0,$417=0,$418=0,$421=0,$423=0,$426=0,$431=0,$I18_0=0,$438=0,$442=0,$443=0,$458=0,$T_0=0,$K19_0=0,$467=0,$468=0,$481=0,$482=0,$484=0,$496=0,$sp_0_in_i=0,$sp_0_i=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){label=140;break}else{label=2;break};case 2:$3=$mem-8|0;$5=HEAP32[131282]|0;if($3>>>0<$5>>>0){label=139;break}else{label=3;break};case 3:$10=HEAP32[$mem-4>>2]|0;$11=$10&3;if(($11|0)==1){label=139;break}else{label=4;break};case 4:$14=$10&-8;$15=$mem+($14-8)|0;$16=$15;if(($10&1|0)==0){label=5;break}else{$p_0=$3;$psize_0=$14;label=56;break};case 5:$21=HEAP32[$3>>2]|0;if(($11|0)==0){label=140;break}else{label=6;break};case 6:$_sum232=-8-$21|0;$24=$mem+$_sum232|0;$25=$24;$26=$21+$14|0;if($24>>>0<$5>>>0){label=139;break}else{label=7;break};case 7:if(($25|0)==(HEAP32[131283]|0)){label=54;break}else{label=8;break};case 8:$32=$21>>>3;if($21>>>0<256){label=9;break}else{label=21;break};case 9:$37=HEAP32[$mem+($_sum232+8)>>2]|0;$40=HEAP32[$mem+($_sum232+12)>>2]|0;$43=525152+($32<<1<<2)|0;if(($37|0)==($43|0)){label=12;break}else{label=10;break};case 10:if($37>>>0<$5>>>0){label=20;break}else{label=11;break};case 11:if((HEAP32[$37+12>>2]|0)==($25|0)){label=12;break}else{label=20;break};case 12:if(($40|0)==($37|0)){label=13;break}else{label=14;break};case 13:HEAP32[131278]=HEAP32[131278]&~(1<<$32);$p_0=$25;$psize_0=$26;label=56;break;case 14:if(($40|0)==($43|0)){label=15;break}else{label=16;break};case 15:$_pre_phi306=$40+8|0;label=18;break;case 16:if($40>>>0<$5>>>0){label=19;break}else{label=17;break};case 17:$64=$40+8|0;if((HEAP32[$64>>2]|0)==($25|0)){$_pre_phi306=$64;label=18;break}else{label=19;break};case 18:HEAP32[$37+12>>2]=$40;HEAP32[$_pre_phi306>>2]=$37;$p_0=$25;$psize_0=$26;label=56;break;case 19:_abort();case 20:_abort();case 21:$69=$24;$72=HEAP32[$mem+($_sum232+24)>>2]|0;$75=HEAP32[$mem+($_sum232+12)>>2]|0;if(($75|0)==($69|0)){label=27;break}else{label=22;break};case 22:$80=HEAP32[$mem+($_sum232+8)>>2]|0;if($80>>>0<$5>>>0){label=26;break}else{label=23;break};case 23:$84=$80+12|0;if((HEAP32[$84>>2]|0)==($69|0)){label=24;break}else{label=26;break};case 24:$88=$75+8|0;if((HEAP32[$88>>2]|0)==($69|0)){label=25;break}else{label=26;break};case 25:HEAP32[$84>>2]=$75;HEAP32[$88>>2]=$80;$R_1=$75;label=34;break;case 26:_abort();case 27:$94=$mem+($_sum232+20)|0;$95=HEAP32[$94>>2]|0;if(($95|0)==0){label=28;break}else{$R_0=$95;$RP_0=$94;label=29;break};case 28:$99=$mem+($_sum232+16)|0;$100=HEAP32[$99>>2]|0;if(($100|0)==0){$R_1=0;label=34;break}else{$R_0=$100;$RP_0=$99;label=29;break};case 29:$102=$R_0+20|0;$103=HEAP32[$102>>2]|0;if(($103|0)==0){label=30;break}else{$R_0=$103;$RP_0=$102;label=29;break};case 30:$106=$R_0+16|0;$107=HEAP32[$106>>2]|0;if(($107|0)==0){label=31;break}else{$R_0=$107;$RP_0=$106;label=29;break};case 31:if($RP_0>>>0<$5>>>0){label=33;break}else{label=32;break};case 32:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=34;break;case 33:_abort();case 34:if(($72|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=35;break};case 35:$118=$mem+($_sum232+28)|0;$120=525416+(HEAP32[$118>>2]<<2)|0;if(($69|0)==(HEAP32[$120>>2]|0)){label=36;break}else{label=38;break};case 36:HEAP32[$120>>2]=$R_1;if(($R_1|0)==0){label=37;break}else{label=44;break};case 37:HEAP32[131279]=HEAP32[131279]&~(1<<HEAP32[$118>>2]);$p_0=$25;$psize_0=$26;label=56;break;case 38:if($72>>>0<(HEAP32[131282]|0)>>>0){label=42;break}else{label=39;break};case 39:$134=$72+16|0;if((HEAP32[$134>>2]|0)==($69|0)){label=40;break}else{label=41;break};case 40:HEAP32[$134>>2]=$R_1;label=43;break;case 41:HEAP32[$72+20>>2]=$R_1;label=43;break;case 42:_abort();case 43:if(($R_1|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=44;break};case 44:if($R_1>>>0<(HEAP32[131282]|0)>>>0){label=53;break}else{label=45;break};case 45:HEAP32[$R_1+24>>2]=$72;$151=HEAP32[$mem+($_sum232+16)>>2]|0;if(($151|0)==0){label=49;break}else{label=46;break};case 46:if($151>>>0<(HEAP32[131282]|0)>>>0){label=48;break}else{label=47;break};case 47:HEAP32[$R_1+16>>2]=$151;HEAP32[$151+24>>2]=$R_1;label=49;break;case 48:_abort();case 49:$164=HEAP32[$mem+($_sum232+20)>>2]|0;if(($164|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=50;break};case 50:if($164>>>0<(HEAP32[131282]|0)>>>0){label=52;break}else{label=51;break};case 51:HEAP32[$R_1+20>>2]=$164;HEAP32[$164+24>>2]=$R_1;$p_0=$25;$psize_0=$26;label=56;break;case 52:_abort();case 53:_abort();case 54:$177=$mem+($14-4)|0;if((HEAP32[$177>>2]&3|0)==3){label=55;break}else{$p_0=$25;$psize_0=$26;label=56;break};case 55:HEAP32[131280]=$26;HEAP32[$177>>2]=HEAP32[$177>>2]&-2;HEAP32[$mem+($_sum232+4)>>2]=$26|1;HEAP32[$15>>2]=$26;label=140;break;case 56:$189=$p_0;if($189>>>0<$15>>>0){label=57;break}else{label=139;break};case 57:$193=$mem+($14-4)|0;$194=HEAP32[$193>>2]|0;if(($194&1|0)==0){label=139;break}else{label=58;break};case 58:if(($194&2|0)==0){label=59;break}else{label=112;break};case 59:if(($16|0)==(HEAP32[131284]|0)){label=60;break}else{label=62;break};case 60:$204=(HEAP32[131281]|0)+$psize_0|0;HEAP32[131281]=$204;HEAP32[131284]=$p_0;HEAP32[$p_0+4>>2]=$204|1;if(($p_0|0)==(HEAP32[131283]|0)){label=61;break}else{label=140;break};case 61:HEAP32[131283]=0;HEAP32[131280]=0;label=140;break;case 62:if(($16|0)==(HEAP32[131283]|0)){label=63;break}else{label=64;break};case 63:$215=(HEAP32[131280]|0)+$psize_0|0;HEAP32[131280]=$215;HEAP32[131283]=$p_0;HEAP32[$p_0+4>>2]=$215|1;HEAP32[$189+$215>>2]=$215;label=140;break;case 64:$222=($194&-8)+$psize_0|0;$223=$194>>>3;if($194>>>0<256){label=65;break}else{label=77;break};case 65:$228=HEAP32[$mem+$14>>2]|0;$231=HEAP32[$mem+($14|4)>>2]|0;$234=525152+($223<<1<<2)|0;if(($228|0)==($234|0)){label=68;break}else{label=66;break};case 66:if($228>>>0<(HEAP32[131282]|0)>>>0){label=76;break}else{label=67;break};case 67:if((HEAP32[$228+12>>2]|0)==($16|0)){label=68;break}else{label=76;break};case 68:if(($231|0)==($228|0)){label=69;break}else{label=70;break};case 69:HEAP32[131278]=HEAP32[131278]&~(1<<$223);label=110;break;case 70:if(($231|0)==($234|0)){label=71;break}else{label=72;break};case 71:$_pre_phi304=$231+8|0;label=74;break;case 72:if($231>>>0<(HEAP32[131282]|0)>>>0){label=75;break}else{label=73;break};case 73:$257=$231+8|0;if((HEAP32[$257>>2]|0)==($16|0)){$_pre_phi304=$257;label=74;break}else{label=75;break};case 74:HEAP32[$228+12>>2]=$231;HEAP32[$_pre_phi304>>2]=$228;label=110;break;case 75:_abort();case 76:_abort();case 77:$262=$15;$265=HEAP32[$mem+($14+16)>>2]|0;$268=HEAP32[$mem+($14|4)>>2]|0;if(($268|0)==($262|0)){label=83;break}else{label=78;break};case 78:$273=HEAP32[$mem+$14>>2]|0;if($273>>>0<(HEAP32[131282]|0)>>>0){label=82;break}else{label=79;break};case 79:$278=$273+12|0;if((HEAP32[$278>>2]|0)==($262|0)){label=80;break}else{label=82;break};case 80:$282=$268+8|0;if((HEAP32[$282>>2]|0)==($262|0)){label=81;break}else{label=82;break};case 81:HEAP32[$278>>2]=$268;HEAP32[$282>>2]=$273;$R7_1=$268;label=90;break;case 82:_abort();case 83:$288=$mem+($14+12)|0;$289=HEAP32[$288>>2]|0;if(($289|0)==0){label=84;break}else{$R7_0=$289;$RP9_0=$288;label=85;break};case 84:$293=$mem+($14+8)|0;$294=HEAP32[$293>>2]|0;if(($294|0)==0){$R7_1=0;label=90;break}else{$R7_0=$294;$RP9_0=$293;label=85;break};case 85:$296=$R7_0+20|0;$297=HEAP32[$296>>2]|0;if(($297|0)==0){label=86;break}else{$R7_0=$297;$RP9_0=$296;label=85;break};case 86:$300=$R7_0+16|0;$301=HEAP32[$300>>2]|0;if(($301|0)==0){label=87;break}else{$R7_0=$301;$RP9_0=$300;label=85;break};case 87:if($RP9_0>>>0<(HEAP32[131282]|0)>>>0){label=89;break}else{label=88;break};case 88:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=90;break;case 89:_abort();case 90:if(($265|0)==0){label=110;break}else{label=91;break};case 91:$313=$mem+($14+20)|0;$315=525416+(HEAP32[$313>>2]<<2)|0;if(($262|0)==(HEAP32[$315>>2]|0)){label=92;break}else{label=94;break};case 92:HEAP32[$315>>2]=$R7_1;if(($R7_1|0)==0){label=93;break}else{label=100;break};case 93:HEAP32[131279]=HEAP32[131279]&~(1<<HEAP32[$313>>2]);label=110;break;case 94:if($265>>>0<(HEAP32[131282]|0)>>>0){label=98;break}else{label=95;break};case 95:$329=$265+16|0;if((HEAP32[$329>>2]|0)==($262|0)){label=96;break}else{label=97;break};case 96:HEAP32[$329>>2]=$R7_1;label=99;break;case 97:HEAP32[$265+20>>2]=$R7_1;label=99;break;case 98:_abort();case 99:if(($R7_1|0)==0){label=110;break}else{label=100;break};case 100:if($R7_1>>>0<(HEAP32[131282]|0)>>>0){label=109;break}else{label=101;break};case 101:HEAP32[$R7_1+24>>2]=$265;$346=HEAP32[$mem+($14+8)>>2]|0;if(($346|0)==0){label=105;break}else{label=102;break};case 102:if($346>>>0<(HEAP32[131282]|0)>>>0){label=104;break}else{label=103;break};case 103:HEAP32[$R7_1+16>>2]=$346;HEAP32[$346+24>>2]=$R7_1;label=105;break;case 104:_abort();case 105:$359=HEAP32[$mem+($14+12)>>2]|0;if(($359|0)==0){label=110;break}else{label=106;break};case 106:if($359>>>0<(HEAP32[131282]|0)>>>0){label=108;break}else{label=107;break};case 107:HEAP32[$R7_1+20>>2]=$359;HEAP32[$359+24>>2]=$R7_1;label=110;break;case 108:_abort();case 109:_abort();case 110:HEAP32[$p_0+4>>2]=$222|1;HEAP32[$189+$222>>2]=$222;if(($p_0|0)==(HEAP32[131283]|0)){label=111;break}else{$psize_1=$222;label=113;break};case 111:HEAP32[131280]=$222;label=140;break;case 112:HEAP32[$193>>2]=$194&-2;HEAP32[$p_0+4>>2]=$psize_0|1;HEAP32[$189+$psize_0>>2]=$psize_0;$psize_1=$psize_0;label=113;break;case 113:$385=$psize_1>>>3;if($psize_1>>>0<256){label=114;break}else{label=119;break};case 114:$388=$385<<1;$390=525152+($388<<2)|0;$391=HEAP32[131278]|0;$392=1<<$385;if(($391&$392|0)==0){label=115;break}else{label=116;break};case 115:HEAP32[131278]=$391|$392;$F16_0=$390;$_pre_phi=525152+($388+2<<2)|0;label=118;break;case 116:$398=525152+($388+2<<2)|0;$399=HEAP32[$398>>2]|0;if($399>>>0<(HEAP32[131282]|0)>>>0){label=117;break}else{$F16_0=$399;$_pre_phi=$398;label=118;break};case 117:_abort();case 118:HEAP32[$_pre_phi>>2]=$p_0;HEAP32[$F16_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$F16_0;HEAP32[$p_0+12>>2]=$390;label=140;break;case 119:$409=$p_0;$410=$psize_1>>>8;if(($410|0)==0){$I18_0=0;label=122;break}else{label=120;break};case 120:if($psize_1>>>0>16777215){$I18_0=31;label=122;break}else{label=121;break};case 121:$417=($410+1048320|0)>>>16&8;$418=$410<<$417;$421=($418+520192|0)>>>16&4;$423=$418<<$421;$426=($423+245760|0)>>>16&2;$431=14-($421|$417|$426)+($423<<$426>>>15)|0;$I18_0=$psize_1>>>(($431+7|0)>>>0)&1|$431<<1;label=122;break;case 122:$438=525416+($I18_0<<2)|0;HEAP32[$p_0+28>>2]=$I18_0;HEAP32[$p_0+20>>2]=0;HEAP32[$p_0+16>>2]=0;$442=HEAP32[131279]|0;$443=1<<$I18_0;if(($442&$443|0)==0){label=123;break}else{label=124;break};case 123:HEAP32[131279]=$442|$443;HEAP32[$438>>2]=$409;HEAP32[$p_0+24>>2]=$438;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=136;break;case 124:if(($I18_0|0)==31){$458=0;label=126;break}else{label=125;break};case 125:$458=25-($I18_0>>>1)|0;label=126;break;case 126:$K19_0=$psize_1<<$458;$T_0=HEAP32[$438>>2]|0;label=127;break;case 127:if((HEAP32[$T_0+4>>2]&-8|0)==($psize_1|0)){label=132;break}else{label=128;break};case 128:$467=$T_0+16+($K19_0>>>31<<2)|0;$468=HEAP32[$467>>2]|0;if(($468|0)==0){label=129;break}else{$K19_0=$K19_0<<1;$T_0=$468;label=127;break};case 129:if($467>>>0<(HEAP32[131282]|0)>>>0){label=131;break}else{label=130;break};case 130:HEAP32[$467>>2]=$409;HEAP32[$p_0+24>>2]=$T_0;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=136;break;case 131:_abort();case 132:$481=$T_0+8|0;$482=HEAP32[$481>>2]|0;$484=HEAP32[131282]|0;if($T_0>>>0<$484>>>0){label=135;break}else{label=133;break};case 133:if($482>>>0<$484>>>0){label=135;break}else{label=134;break};case 134:HEAP32[$482+12>>2]=$409;HEAP32[$481>>2]=$409;HEAP32[$p_0+8>>2]=$482;HEAP32[$p_0+12>>2]=$T_0;HEAP32[$p_0+24>>2]=0;label=136;break;case 135:_abort();case 136:$496=(HEAP32[131286]|0)-1|0;HEAP32[131286]=$496;if(($496|0)==0){$sp_0_in_i=525568;label=137;break}else{label=140;break};case 137:$sp_0_i=HEAP32[$sp_0_in_i>>2]|0;if(($sp_0_i|0)==0){label=138;break}else{$sp_0_in_i=$sp_0_i+8|0;label=137;break};case 138:HEAP32[131286]=-1;label=140;break;case 139:_abort();case 140:return}}function _memset(ptr,value,num){ptr=ptr|0;value=value|0;num=num|0;var stop=0,value4=0,stop4=0,unaligned=0;stop=ptr+num|0;if((num|0)>=20){value=value&255;unaligned=ptr&3;value4=value|value<<8|value<<16|value<<24;stop4=stop&~3;if(unaligned){unaligned=ptr+4-unaligned|0;while((ptr|0)<(unaligned|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}while((ptr|0)<(stop4|0)){HEAP32[ptr>>2]=value4;ptr=ptr+4|0}}while((ptr|0)<(stop|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}function _memcpy(dest,src,num){dest=dest|0;src=src|0;num=num|0;var ret=0;ret=dest|0;if((dest&3)==(src&3)){while(dest&3){if((num|0)==0)return ret|0;HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}while((num|0)>=4){HEAP32[dest>>2]=HEAP32[src>>2];dest=dest+4|0;src=src+4|0;num=num-4|0}}while((num|0)>0){HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}return ret|0}function _strlen(ptr){ptr=ptr|0;var curr=0;curr=ptr;while(HEAP8[curr]|0){curr=curr+1|0}return curr-ptr|0}function dynCall_ii(index,a1){index=index|0;a1=a1|0;return FUNCTION_TABLE_ii[index&1](a1|0)|0}function dynCall_v(index){index=index|0;FUNCTION_TABLE_v[index&1]()}function dynCall_iii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;return FUNCTION_TABLE_iii[index&1](a1|0,a2|0)|0}function dynCall_vi(index,a1){index=index|0;a1=a1|0;FUNCTION_TABLE_vi[index&1](a1|0)}function b0(p0){p0=p0|0;abort(0);return 0}function b1(){abort(1)}function b2(p0,p1){p0=p0|0;p1=p1|0;abort(2);return 0}function b3(p0){p0=p0|0;abort(3)}
// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_ii = [b0,b0];
  var FUNCTION_TABLE_v = [b1,b1];
  var FUNCTION_TABLE_iii = [b2,b2];
  var FUNCTION_TABLE_vi = [b3,b3];
  return { _strlen: _strlen, _free: _free, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _convert: _convert, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_ii: dynCall_ii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii, dynCall_vi: dynCall_vi };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_vi": invoke_vi, "_sysconf": _sysconf, "_sbrk": _sbrk, "___setErrNo": ___setErrNo, "___errno_location": ___errno_location, "_abort": _abort, "_time": _time, "_fflush": _fflush, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _convert = Module["_convert"] = asm["_convert"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      throw e;
    }
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
