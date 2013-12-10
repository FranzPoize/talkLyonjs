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
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
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
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
    assert(type, 'Must know what type to store in allocate!');
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
    assert(ptr + i < TOTAL_MEMORY);
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
    assert(ptr + i < TOTAL_MEMORY);
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
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
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
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
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
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
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
function runPostSets() {
}
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
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32=_memset;
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
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
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
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
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
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
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
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
var FUNCTION_TABLE = [0, 0];
// EMSCRIPTEN_START_FUNCS
// WARNING: content after a branch in a label, line: 248
// WARNING: content after a branch in a label, line: 265
// WARNING: content after a branch in a label, line: 300
// WARNING: content after a branch in a label, line: 316
// WARNING: content after a branch in a label, line: 355
// WARNING: content after a branch in a label, line: 376
// WARNING: content after a branch in a label, line: 397
// WARNING: content after a branch in a label, line: 418
// WARNING: content after a branch in a label, line: 439
// WARNING: content after a branch in a label, line: 622
// WARNING: content after a branch in a label, line: 652
// WARNING: content after a branch in a label, line: 690
// WARNING: content after a branch in a label, line: 738
// WARNING: content after a branch in a label, line: 753
// WARNING: content after a branch in a label, line: 833
// WARNING: content after a branch in a label, line: 854
// WARNING: content after a branch in a label, line: 956
function _njSkip($count) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   $1=$count;
   var $2=$1;
   var $3=HEAP32[((((76)|0))>>2)];
   var $4=(($3+$2)|0);
   HEAP32[((((76)|0))>>2)]=$4;
   var $5=$1;
   var $6=HEAP32[((((80)|0))>>2)];
   var $7=((($6)-($5))|0);
   HEAP32[((((80)|0))>>2)]=$7;
   var $8=$1;
   var $9=HEAP32[((((84)|0))>>2)];
   var $10=((($9)-($8))|0);
   HEAP32[((((84)|0))>>2)]=$10;
   var $11=HEAP32[((((80)|0))>>2)];
   var $12=(($11)|(0)) < 0;
   if ($12) { label = 2; break; } else { label = 3; break; }
  case 2: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njInit() {
 var label = 0;
 _memset(72, 0, 525000);
 return;
}
function _njDone() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i;
   $i=0;
   label = 2; break;
  case 2: 
   var $2=$i;
   var $3=(($2)|(0)) < 3;
   if ($3) { label = 3; break; } else { label = 7; break; }
  case 3: 
   var $5=$i;
   var $6=((((116)|0)+((($5)*(44))&-1))|0);
   var $7=(($6+40)|0);
   var $8=HEAP32[(($7)>>2)];
   var $9=(($8)|(0))!=0;
   if ($9) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $11=$i;
   var $12=((((116)|0)+((($11)*(44))&-1))|0);
   var $13=(($12+40)|0);
   var $14=HEAP32[(($13)>>2)];
   _free($14);
   label = 5; break;
  case 5: 
   label = 6; break;
  case 6: 
   var $17=$i;
   var $18=((($17)+(1))|0);
   $i=$18;
   label = 2; break;
  case 7: 
   var $20=HEAP32[((((525068)|0))>>2)];
   var $21=(($20)|(0))!=0;
   if ($21) { label = 8; break; } else { label = 9; break; }
  case 8: 
   var $23=HEAP32[((((525068)|0))>>2)];
   _free($23);
   label = 9; break;
  case 9: 
   _njInit();
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecode($jpeg, $size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $2=$jpeg;
   $3=$size;
   _njDone();
   var $4=$2;
   HEAP32[((((76)|0))>>2)]=$4;
   var $5=$3;
   var $6=$5 & 2147483647;
   HEAP32[((((80)|0))>>2)]=$6;
   var $7=HEAP32[((((80)|0))>>2)];
   var $8=(($7)|(0)) < 2;
   if ($8) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $1=1;
   label = 25; break;
  case 3: 
   var $11=HEAP32[((((76)|0))>>2)];
   var $12=(($11)|0);
   var $13=HEAP8[($12)];
   var $14=(($13)&(255));
   var $15=$14 ^ 255;
   var $16=HEAP32[((((76)|0))>>2)];
   var $17=(($16+1)|0);
   var $18=HEAP8[($17)];
   var $19=(($18)&(255));
   var $20=$19 ^ 216;
   var $21=$15 | $20;
   var $22=(($21)|(0))!=0;
   if ($22) { label = 4; break; } else { label = 5; break; }
  case 4: 
   $1=1;
   label = 25; break;
  case 5: 
   _njSkip(2);
   label = 6; break;
  case 6: 
   var $26=HEAP32[((((72)|0))>>2)];
   var $27=(($26)|(0))!=0;
   var $28=$27 ^ 1;
   if ($28) { label = 7; break; } else { label = 22; break; }
  case 7: 
   var $30=HEAP32[((((80)|0))>>2)];
   var $31=(($30)|(0)) < 2;
   if ($31) { label = 9; break; } else { label = 8; break; }
  case 8: 
   var $33=HEAP32[((((76)|0))>>2)];
   var $34=(($33)|0);
   var $35=HEAP8[($34)];
   var $36=(($35)&(255));
   var $37=(($36)|(0))!=255;
   if ($37) { label = 9; break; } else { label = 10; break; }
  case 9: 
   $1=5;
   label = 25; break;
  case 10: 
   _njSkip(2);
   var $40=HEAP32[((((76)|0))>>2)];
   var $41=((($40)-(1))|0);
   var $42=HEAP8[($41)];
   var $43=(($42)&(255));
   switch((($43)|(0))) {
   case 192:{
    label = 11; break;
   }
   case 196:{
    label = 12; break;
   }
   case 219:{
    label = 13; break;
   }
   case 221:{
    label = 14; break;
   }
   case 218:{
    label = 15; break;
   }
   case 254:{
    label = 16; break;
   }
   default: {
   label = 17; break;
   }
   } break; 
  case 11: 
   _njDecodeSOF();
   label = 21; break;
  case 12: 
   _njDecodeDHT();
   label = 21; break;
  case 13: 
   _njDecodeDQT();
   label = 21; break;
  case 14: 
   _njDecodeDRI();
   label = 21; break;
  case 15: 
   _njDecodeScan();
   label = 21; break;
  case 16: 
   _njSkipMarker();
   label = 21; break;
  case 17: 
   var $51=HEAP32[((((76)|0))>>2)];
   var $52=((($51)-(1))|0);
   var $53=HEAP8[($52)];
   var $54=(($53)&(255));
   var $55=$54 & 240;
   var $56=(($55)|(0))==224;
   if ($56) { label = 18; break; } else { label = 19; break; }
  case 18: 
   _njSkipMarker();
   label = 20; break;
  case 19: 
   $1=2;
   label = 25; break;
  case 20: 
   label = 21; break;
  case 21: 
   label = 6; break;
  case 22: 
   var $62=HEAP32[((((72)|0))>>2)];
   var $63=(($62)|(0))!=6;
   if ($63) { label = 23; break; } else { label = 24; break; }
  case 23: 
   var $65=HEAP32[((((72)|0))>>2)];
   $1=$65;
   label = 25; break;
  case 24: 
   HEAP32[((((72)|0))>>2)]=0;
   _njConvert();
   var $67=HEAP32[((((72)|0))>>2)];
   $1=$67;
   label = 25; break;
  case 25: 
   var $69=$1;
   return $69;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecodeSOF() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i;
   var $ssxmax;
   var $ssymax;
   var $c;
   $ssxmax=0;
   $ssymax=0;
   _njDecodeLength();
   var $1=HEAP32[((((84)|0))>>2)];
   var $2=(($1)|(0)) < 9;
   if ($2) { label = 2; break; } else { label = 4; break; }
  case 2: 
   label = 3; break;
  case 3: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 58; break;
  case 4: 
   var $7=HEAP32[((((76)|0))>>2)];
   var $8=(($7)|0);
   var $9=HEAP8[($8)];
   var $10=(($9)&(255));
   var $11=(($10)|(0))!=8;
   if ($11) { label = 5; break; } else { label = 7; break; }
  case 5: 
   label = 6; break;
  case 6: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 58; break;
  case 7: 
   var $16=HEAP32[((((76)|0))>>2)];
   var $17=(($16+1)|0);
   var $18=_njDecode16($17);
   var $19=(($18)&(65535));
   HEAP32[((((92)|0))>>2)]=$19;
   var $20=HEAP32[((((76)|0))>>2)];
   var $21=(($20+3)|0);
   var $22=_njDecode16($21);
   var $23=(($22)&(65535));
   HEAP32[((((88)|0))>>2)]=$23;
   var $24=HEAP32[((((76)|0))>>2)];
   var $25=(($24+5)|0);
   var $26=HEAP8[($25)];
   var $27=(($26)&(255));
   HEAP32[((((112)|0))>>2)]=$27;
   _njSkip(6);
   var $28=HEAP32[((((112)|0))>>2)];
   if ((($28)|(0))==1 | (($28)|(0))==3) {
    label = 8; break;
   }
   else {
   label = 9; break;
   }
  case 8: 
   label = 11; break;
  case 9: 
   label = 10; break;
  case 10: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 58; break;
  case 11: 
   var $34=HEAP32[((((84)|0))>>2)];
   var $35=HEAP32[((((112)|0))>>2)];
   var $36=((($35)*(3))&-1);
   var $37=(($34)|(0)) < (($36)|(0));
   if ($37) { label = 12; break; } else { label = 14; break; }
  case 12: 
   label = 13; break;
  case 13: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 58; break;
  case 14: 
   $i=0;
   $c=((116)|0);
   label = 15; break;
  case 15: 
   var $43=$i;
   var $44=HEAP32[((((112)|0))>>2)];
   var $45=(($43)|(0)) < (($44)|(0));
   if ($45) { label = 16; break; } else { label = 37; break; }
  case 16: 
   var $47=HEAP32[((((76)|0))>>2)];
   var $48=(($47)|0);
   var $49=HEAP8[($48)];
   var $50=(($49)&(255));
   var $51=$c;
   var $52=(($51)|0);
   HEAP32[(($52)>>2)]=$50;
   var $53=HEAP32[((((76)|0))>>2)];
   var $54=(($53+1)|0);
   var $55=HEAP8[($54)];
   var $56=(($55)&(255));
   var $57=$56 >> 4;
   var $58=$c;
   var $59=(($58+4)|0);
   HEAP32[(($59)>>2)]=$57;
   var $60=(($57)|(0))!=0;
   if ($60) { label = 19; break; } else { label = 17; break; }
  case 17: 
   label = 18; break;
  case 18: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 58; break;
  case 19: 
   var $65=$c;
   var $66=(($65+4)|0);
   var $67=HEAP32[(($66)>>2)];
   var $68=$c;
   var $69=(($68+4)|0);
   var $70=HEAP32[(($69)>>2)];
   var $71=((($70)-(1))|0);
   var $72=$67 & $71;
   var $73=(($72)|(0))!=0;
   if ($73) { label = 20; break; } else { label = 22; break; }
  case 20: 
   label = 21; break;
  case 21: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 58; break;
  case 22: 
   var $78=HEAP32[((((76)|0))>>2)];
   var $79=(($78+1)|0);
   var $80=HEAP8[($79)];
   var $81=(($80)&(255));
   var $82=$81 & 15;
   var $83=$c;
   var $84=(($83+8)|0);
   HEAP32[(($84)>>2)]=$82;
   var $85=(($82)|(0))!=0;
   if ($85) { label = 25; break; } else { label = 23; break; }
  case 23: 
   label = 24; break;
  case 24: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 58; break;
  case 25: 
   var $90=$c;
   var $91=(($90+8)|0);
   var $92=HEAP32[(($91)>>2)];
   var $93=$c;
   var $94=(($93+8)|0);
   var $95=HEAP32[(($94)>>2)];
   var $96=((($95)-(1))|0);
   var $97=$92 & $96;
   var $98=(($97)|(0))!=0;
   if ($98) { label = 26; break; } else { label = 28; break; }
  case 26: 
   label = 27; break;
  case 27: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 58; break;
  case 28: 
   var $103=HEAP32[((((76)|0))>>2)];
   var $104=(($103+2)|0);
   var $105=HEAP8[($104)];
   var $106=(($105)&(255));
   var $107=$c;
   var $108=(($107+24)|0);
   HEAP32[(($108)>>2)]=$106;
   var $109=$106 & 252;
   var $110=(($109)|(0))!=0;
   if ($110) { label = 29; break; } else { label = 31; break; }
  case 29: 
   label = 30; break;
  case 30: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 58; break;
  case 31: 
   _njSkip(3);
   var $115=$c;
   var $116=(($115+24)|0);
   var $117=HEAP32[(($116)>>2)];
   var $118=1 << $117;
   var $119=HEAP32[((((248)|0))>>2)];
   var $120=$119 | $118;
   HEAP32[((((248)|0))>>2)]=$120;
   var $121=$c;
   var $122=(($121+4)|0);
   var $123=HEAP32[(($122)>>2)];
   var $124=$ssxmax;
   var $125=(($123)|(0)) > (($124)|(0));
   if ($125) { label = 32; break; } else { label = 33; break; }
  case 32: 
   var $127=$c;
   var $128=(($127+4)|0);
   var $129=HEAP32[(($128)>>2)];
   $ssxmax=$129;
   label = 33; break;
  case 33: 
   var $131=$c;
   var $132=(($131+8)|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$ssymax;
   var $135=(($133)|(0)) > (($134)|(0));
   if ($135) { label = 34; break; } else { label = 35; break; }
  case 34: 
   var $137=$c;
   var $138=(($137+8)|0);
   var $139=HEAP32[(($138)>>2)];
   $ssymax=$139;
   label = 35; break;
  case 35: 
   label = 36; break;
  case 36: 
   var $142=$i;
   var $143=((($142)+(1))|0);
   $i=$143;
   var $144=$c;
   var $145=(($144+44)|0);
   $c=$145;
   label = 15; break;
  case 37: 
   var $147=HEAP32[((((112)|0))>>2)];
   var $148=(($147)|(0))==1;
   if ($148) { label = 38; break; } else { label = 39; break; }
  case 38: 
   $c=((116)|0);
   $ssymax=1;
   $ssxmax=1;
   var $150=$c;
   var $151=(($150+8)|0);
   HEAP32[(($151)>>2)]=1;
   var $152=$c;
   var $153=(($152+4)|0);
   HEAP32[(($153)>>2)]=1;
   label = 39; break;
  case 39: 
   var $155=$ssxmax;
   var $156=$155 << 3;
   HEAP32[((((104)|0))>>2)]=$156;
   var $157=$ssymax;
   var $158=$157 << 3;
   HEAP32[((((108)|0))>>2)]=$158;
   var $159=HEAP32[((((88)|0))>>2)];
   var $160=HEAP32[((((104)|0))>>2)];
   var $161=((($159)+($160))|0);
   var $162=((($161)-(1))|0);
   var $163=HEAP32[((((104)|0))>>2)];
   var $164=((((($162)|(0)))/((($163)|(0))))&-1);
   HEAP32[((((96)|0))>>2)]=$164;
   var $165=HEAP32[((((92)|0))>>2)];
   var $166=HEAP32[((((108)|0))>>2)];
   var $167=((($165)+($166))|0);
   var $168=((($167)-(1))|0);
   var $169=HEAP32[((((108)|0))>>2)];
   var $170=((((($168)|(0)))/((($169)|(0))))&-1);
   HEAP32[((((100)|0))>>2)]=$170;
   $i=0;
   $c=((116)|0);
   label = 40; break;
  case 40: 
   var $172=$i;
   var $173=HEAP32[((((112)|0))>>2)];
   var $174=(($172)|(0)) < (($173)|(0));
   if ($174) { label = 41; break; } else { label = 52; break; }
  case 41: 
   var $176=HEAP32[((((88)|0))>>2)];
   var $177=$c;
   var $178=(($177+4)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=(Math.imul($176,$179)|0);
   var $181=$ssxmax;
   var $182=((($180)+($181))|0);
   var $183=((($182)-(1))|0);
   var $184=$ssxmax;
   var $185=((((($183)|(0)))/((($184)|(0))))&-1);
   var $186=$c;
   var $187=(($186+12)|0);
   HEAP32[(($187)>>2)]=$185;
   var $188=$c;
   var $189=(($188+12)|0);
   var $190=HEAP32[(($189)>>2)];
   var $191=((($190)+(7))|0);
   var $192=$191 & 2147483640;
   var $193=$c;
   var $194=(($193+20)|0);
   HEAP32[(($194)>>2)]=$192;
   var $195=HEAP32[((((92)|0))>>2)];
   var $196=$c;
   var $197=(($196+8)|0);
   var $198=HEAP32[(($197)>>2)];
   var $199=(Math.imul($195,$198)|0);
   var $200=$ssymax;
   var $201=((($199)+($200))|0);
   var $202=((($201)-(1))|0);
   var $203=$ssymax;
   var $204=((((($202)|(0)))/((($203)|(0))))&-1);
   var $205=$c;
   var $206=(($205+16)|0);
   HEAP32[(($206)>>2)]=$204;
   var $207=HEAP32[((((96)|0))>>2)];
   var $208=HEAP32[((((104)|0))>>2)];
   var $209=(Math.imul($207,$208)|0);
   var $210=$c;
   var $211=(($210+4)|0);
   var $212=HEAP32[(($211)>>2)];
   var $213=(Math.imul($209,$212)|0);
   var $214=$ssxmax;
   var $215=((((($213)|(0)))/((($214)|(0))))&-1);
   var $216=$c;
   var $217=(($216+20)|0);
   HEAP32[(($217)>>2)]=$215;
   var $218=$c;
   var $219=(($218+12)|0);
   var $220=HEAP32[(($219)>>2)];
   var $221=(($220)|(0)) < 3;
   if ($221) { label = 42; break; } else { label = 43; break; }
  case 42: 
   var $223=$c;
   var $224=(($223+4)|0);
   var $225=HEAP32[(($224)>>2)];
   var $226=$ssxmax;
   var $227=(($225)|(0))!=(($226)|(0));
   if ($227) { label = 45; break; } else { label = 43; break; }
  case 43: 
   var $229=$c;
   var $230=(($229+16)|0);
   var $231=HEAP32[(($230)>>2)];
   var $232=(($231)|(0)) < 3;
   if ($232) { label = 44; break; } else { label = 47; break; }
  case 44: 
   var $234=$c;
   var $235=(($234+8)|0);
   var $236=HEAP32[(($235)>>2)];
   var $237=$ssymax;
   var $238=(($236)|(0))!=(($237)|(0));
   if ($238) { label = 45; break; } else { label = 47; break; }
  case 45: 
   label = 46; break;
  case 46: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 58; break;
  case 47: 
   var $243=$c;
   var $244=(($243+20)|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=HEAP32[((((100)|0))>>2)];
   var $247=HEAP32[((((108)|0))>>2)];
   var $248=(Math.imul($246,$247)|0);
   var $249=$c;
   var $250=(($249+8)|0);
   var $251=HEAP32[(($250)>>2)];
   var $252=(Math.imul($248,$251)|0);
   var $253=$ssymax;
   var $254=((((($252)|(0)))/((($253)|(0))))&-1);
   var $255=(Math.imul($245,$254)|0);
   var $256=_malloc($255);
   var $257=$c;
   var $258=(($257+40)|0);
   HEAP32[(($258)>>2)]=$256;
   var $259=(($256)|(0))!=0;
   if ($259) { label = 50; break; } else { label = 48; break; }
  case 48: 
   label = 49; break;
  case 49: 
   HEAP32[((((72)|0))>>2)]=3;
   label = 58; break;
  case 50: 
   label = 51; break;
  case 51: 
   var $265=$i;
   var $266=((($265)+(1))|0);
   $i=$266;
   var $267=$c;
   var $268=(($267+44)|0);
   $c=$268;
   label = 40; break;
  case 52: 
   var $270=HEAP32[((((112)|0))>>2)];
   var $271=(($270)|(0))==3;
   if ($271) { label = 53; break; } else { label = 57; break; }
  case 53: 
   var $273=HEAP32[((((88)|0))>>2)];
   var $274=HEAP32[((((92)|0))>>2)];
   var $275=(Math.imul($273,$274)|0);
   var $276=HEAP32[((((112)|0))>>2)];
   var $277=(Math.imul($275,$276)|0);
   var $278=_malloc($277);
   HEAP32[((((525068)|0))>>2)]=$278;
   var $279=HEAP32[((((525068)|0))>>2)];
   var $280=(($279)|(0))!=0;
   if ($280) { label = 56; break; } else { label = 54; break; }
  case 54: 
   label = 55; break;
  case 55: 
   HEAP32[((((72)|0))>>2)]=3;
   label = 58; break;
  case 56: 
   label = 57; break;
  case 57: 
   var $286=HEAP32[((((84)|0))>>2)];
   _njSkip($286);
   label = 58; break;
  case 58: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecodeDHT() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $codelen;
   var $currcnt;
   var $remain;
   var $spread;
   var $i;
   var $j;
   var $vlc;
   var $code;
   _njDecodeLength();
   label = 2; break;
  case 2: 
   var $2=HEAP32[((((84)|0))>>2)];
   var $3=(($2)|(0)) >= 17;
   if ($3) { label = 3; break; } else { label = 37; break; }
  case 3: 
   var $5=HEAP32[((((76)|0))>>2)];
   var $6=(($5)|0);
   var $7=HEAP8[($6)];
   var $8=(($7)&(255));
   $i=$8;
   var $9=$i;
   var $10=$9 & 236;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 4; break; } else { label = 6; break; }
  case 4: 
   label = 5; break;
  case 5: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 40; break;
  case 6: 
   var $16=$i;
   var $17=$16 & 2;
   var $18=(($17)|(0))!=0;
   if ($18) { label = 7; break; } else { label = 9; break; }
  case 7: 
   label = 8; break;
  case 8: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 40; break;
  case 9: 
   var $23=$i;
   var $24=$i;
   var $25=$24 >> 3;
   var $26=$23 | $25;
   var $27=$26 & 3;
   $i=$27;
   $codelen=1;
   label = 10; break;
  case 10: 
   var $29=$codelen;
   var $30=(($29)|(0)) <= 16;
   if ($30) { label = 11; break; } else { label = 13; break; }
  case 11: 
   var $32=$codelen;
   var $33=HEAP32[((((76)|0))>>2)];
   var $34=(($33+$32)|0);
   var $35=HEAP8[($34)];
   var $36=$codelen;
   var $37=((($36)-(1))|0);
   var $38=((525096+$37)|0);
   HEAP8[($38)]=$35;
   label = 12; break;
  case 12: 
   var $40=$codelen;
   var $41=((($40)+(1))|0);
   $codelen=$41;
   label = 10; break;
  case 13: 
   _njSkip(17);
   var $43=$i;
   var $44=((((512)|0)+($43<<17))|0);
   var $45=(($44)|0);
   $vlc=$45;
   $spread=65536;
   $remain=65536;
   $codelen=1;
   label = 14; break;
  case 14: 
   var $47=$codelen;
   var $48=(($47)|(0)) <= 16;
   if ($48) { label = 15; break; } else { label = 33; break; }
  case 15: 
   var $50=$spread;
   var $51=$50 >> 1;
   $spread=$51;
   var $52=$codelen;
   var $53=((($52)-(1))|0);
   var $54=((525096+$53)|0);
   var $55=HEAP8[($54)];
   var $56=(($55)&(255));
   $currcnt=$56;
   var $57=$currcnt;
   var $58=(($57)|(0))!=0;
   if ($58) { label = 17; break; } else { label = 16; break; }
  case 16: 
   label = 32; break;
  case 17: 
   var $61=HEAP32[((((84)|0))>>2)];
   var $62=$currcnt;
   var $63=(($61)|(0)) < (($62)|(0));
   if ($63) { label = 18; break; } else { label = 20; break; }
  case 18: 
   label = 19; break;
  case 19: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 40; break;
  case 20: 
   var $68=$currcnt;
   var $69=$codelen;
   var $70=(((16)-($69))|0);
   var $71=$68 << $70;
   var $72=$remain;
   var $73=((($72)-($71))|0);
   $remain=$73;
   var $74=$remain;
   var $75=(($74)|(0)) < 0;
   if ($75) { label = 21; break; } else { label = 23; break; }
  case 21: 
   label = 22; break;
  case 22: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 40; break;
  case 23: 
   $i=0;
   label = 24; break;
  case 24: 
   var $81=$i;
   var $82=$currcnt;
   var $83=(($81)|(0)) < (($82)|(0));
   if ($83) { label = 25; break; } else { label = 31; break; }
  case 25: 
   var $85=$i;
   var $86=HEAP32[((((76)|0))>>2)];
   var $87=(($86+$85)|0);
   var $88=HEAP8[($87)];
   $code=$88;
   var $89=$spread;
   $j=$89;
   label = 26; break;
  case 26: 
   var $91=$j;
   var $92=(($91)|(0))!=0;
   if ($92) { label = 27; break; } else { label = 29; break; }
  case 27: 
   var $94=$codelen;
   var $95=(($94) & 255);
   var $96=$vlc;
   var $97=(($96)|0);
   HEAP8[($97)]=$95;
   var $98=$code;
   var $99=$vlc;
   var $100=(($99+1)|0);
   HEAP8[($100)]=$98;
   var $101=$vlc;
   var $102=(($101+2)|0);
   $vlc=$102;
   label = 28; break;
  case 28: 
   var $104=$j;
   var $105=((($104)-(1))|0);
   $j=$105;
   label = 26; break;
  case 29: 
   label = 30; break;
  case 30: 
   var $108=$i;
   var $109=((($108)+(1))|0);
   $i=$109;
   label = 24; break;
  case 31: 
   var $111=$currcnt;
   _njSkip($111);
   label = 32; break;
  case 32: 
   var $113=$codelen;
   var $114=((($113)+(1))|0);
   $codelen=$114;
   label = 14; break;
  case 33: 
   label = 34; break;
  case 34: 
   var $117=$remain;
   var $118=((($117)-(1))|0);
   $remain=$118;
   var $119=(($117)|(0))!=0;
   if ($119) { label = 35; break; } else { label = 36; break; }
  case 35: 
   var $121=$vlc;
   var $122=(($121)|0);
   HEAP8[($122)]=0;
   var $123=$vlc;
   var $124=(($123+2)|0);
   $vlc=$124;
   label = 34; break;
  case 36: 
   label = 2; break;
  case 37: 
   var $127=HEAP32[((((84)|0))>>2)];
   var $128=(($127)|(0))!=0;
   if ($128) { label = 38; break; } else { label = 40; break; }
  case 38: 
   label = 39; break;
  case 39: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 40; break;
  case 40: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
// WARNING: content after a branch in a label, line: 990
// WARNING: content after a branch in a label, line: 1044
// WARNING: content after a branch in a label, line: 1062
// WARNING: content after a branch in a label, line: 1103
// WARNING: content after a branch in a label, line: 1121
// WARNING: content after a branch in a label, line: 1153
// WARNING: content after a branch in a label, line: 1171
// WARNING: content after a branch in a label, line: 1232
// WARNING: content after a branch in a label, line: 1404
// WARNING: content after a branch in a label, line: 1581
function _njGetWidth() {
 var label = 0;
 var $1=HEAP32[((((88)|0))>>2)];
 return $1;
}
function _njGetHeight() {
 var label = 0;
 var $1=HEAP32[((((92)|0))>>2)];
 return $1;
}
function _njGetImage() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=HEAP32[((((112)|0))>>2)];
   var $2=(($1)|(0))==1;
   if ($2) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $4=HEAP32[((((156)|0))>>2)];
   var $8 = $4;label = 4; break;
  case 3: 
   var $6=HEAP32[((((525068)|0))>>2)];
   var $8 = $6;label = 4; break;
  case 4: 
   var $8;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _njGetImageSize() {
 var label = 0;
 var $1=HEAP32[((((88)|0))>>2)];
 var $2=HEAP32[((((92)|0))>>2)];
 var $3=(Math.imul($1,$2)|0);
 var $4=HEAP32[((((112)|0))>>2)];
 var $5=(Math.imul($3,$4)|0);
 return $5;
}
function _njDecodeDQT() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i;
   var $t;
   _njDecodeLength();
   label = 2; break;
  case 2: 
   var $2=HEAP32[((((84)|0))>>2)];
   var $3=(($2)|(0)) >= 65;
   if ($3) { label = 3; break; } else { label = 11; break; }
  case 3: 
   var $5=HEAP32[((((76)|0))>>2)];
   var $6=(($5)|0);
   var $7=HEAP8[($6)];
   var $8=(($7)&(255));
   $i=$8;
   var $9=$i;
   var $10=$9 & 252;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 4; break; } else { label = 6; break; }
  case 4: 
   label = 5; break;
  case 5: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 14; break;
  case 6: 
   var $16=$i;
   var $17=1 << $16;
   var $18=HEAP32[((((252)|0))>>2)];
   var $19=$18 | $17;
   HEAP32[((((252)|0))>>2)]=$19;
   var $20=$i;
   var $21=((((256)|0)+($20<<6))|0);
   var $22=(($21)|0);
   $t=$22;
   $i=0;
   label = 7; break;
  case 7: 
   var $24=$i;
   var $25=(($24)|(0)) < 64;
   if ($25) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $27=$i;
   var $28=((($27)+(1))|0);
   var $29=HEAP32[((((76)|0))>>2)];
   var $30=(($29+$28)|0);
   var $31=HEAP8[($30)];
   var $32=$i;
   var $33=$t;
   var $34=(($33+$32)|0);
   HEAP8[($34)]=$31;
   label = 9; break;
  case 9: 
   var $36=$i;
   var $37=((($36)+(1))|0);
   $i=$37;
   label = 7; break;
  case 10: 
   _njSkip(65);
   label = 2; break;
  case 11: 
   var $40=HEAP32[((((84)|0))>>2)];
   var $41=(($40)|(0))!=0;
   if ($41) { label = 12; break; } else { label = 14; break; }
  case 12: 
   label = 13; break;
  case 13: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 14; break;
  case 14: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecodeDRI() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   _njDecodeLength();
   var $1=HEAP32[((((84)|0))>>2)];
   var $2=(($1)|(0)) < 2;
   if ($2) { label = 2; break; } else { label = 4; break; }
  case 2: 
   label = 3; break;
  case 3: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 5; break;
  case 4: 
   var $7=HEAP32[((((76)|0))>>2)];
   var $8=_njDecode16($7);
   var $9=(($8)&(65535));
   HEAP32[((((525064)|0))>>2)]=$9;
   var $10=HEAP32[((((84)|0))>>2)];
   _njSkip($10);
   label = 5; break;
  case 5: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecodeScan() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i;
   var $mbx;
   var $mby;
   var $sbx;
   var $sby;
   var $rstcount;
   var $nextrst;
   var $c;
   var $1=HEAP32[((((525064)|0))>>2)];
   $rstcount=$1;
   $nextrst=0;
   _njDecodeLength();
   var $2=HEAP32[((((84)|0))>>2)];
   var $3=HEAP32[((((112)|0))>>2)];
   var $4=($3<<1);
   var $5=((($4)+(4))|0);
   var $6=(($2)|(0)) < (($5)|(0));
   if ($6) { label = 2; break; } else { label = 4; break; }
  case 2: 
   label = 3; break;
  case 3: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 56; break;
  case 4: 
   var $11=HEAP32[((((76)|0))>>2)];
   var $12=(($11)|0);
   var $13=HEAP8[($12)];
   var $14=(($13)&(255));
   var $15=HEAP32[((((112)|0))>>2)];
   var $16=(($14)|(0))!=(($15)|(0));
   if ($16) { label = 5; break; } else { label = 7; break; }
  case 5: 
   label = 6; break;
  case 6: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 56; break;
  case 7: 
   _njSkip(1);
   $i=0;
   $c=((116)|0);
   label = 8; break;
  case 8: 
   var $22=$i;
   var $23=HEAP32[((((112)|0))>>2)];
   var $24=(($22)|(0)) < (($23)|(0));
   if ($24) { label = 9; break; } else { label = 17; break; }
  case 9: 
   var $26=HEAP32[((((76)|0))>>2)];
   var $27=(($26)|0);
   var $28=HEAP8[($27)];
   var $29=(($28)&(255));
   var $30=$c;
   var $31=(($30)|0);
   var $32=HEAP32[(($31)>>2)];
   var $33=(($29)|(0))!=(($32)|(0));
   if ($33) { label = 10; break; } else { label = 12; break; }
  case 10: 
   label = 11; break;
  case 11: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 56; break;
  case 12: 
   var $38=HEAP32[((((76)|0))>>2)];
   var $39=(($38+1)|0);
   var $40=HEAP8[($39)];
   var $41=(($40)&(255));
   var $42=$41 & 238;
   var $43=(($42)|(0))!=0;
   if ($43) { label = 13; break; } else { label = 15; break; }
  case 13: 
   label = 14; break;
  case 14: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 56; break;
  case 15: 
   var $48=HEAP32[((((76)|0))>>2)];
   var $49=(($48+1)|0);
   var $50=HEAP8[($49)];
   var $51=(($50)&(255));
   var $52=$51 >> 4;
   var $53=$c;
   var $54=(($53+32)|0);
   HEAP32[(($54)>>2)]=$52;
   var $55=HEAP32[((((76)|0))>>2)];
   var $56=(($55+1)|0);
   var $57=HEAP8[($56)];
   var $58=(($57)&(255));
   var $59=$58 & 1;
   var $60=$59 | 2;
   var $61=$c;
   var $62=(($61+28)|0);
   HEAP32[(($62)>>2)]=$60;
   _njSkip(2);
   label = 16; break;
  case 16: 
   var $64=$i;
   var $65=((($64)+(1))|0);
   $i=$65;
   var $66=$c;
   var $67=(($66+44)|0);
   $c=$67;
   label = 8; break;
  case 17: 
   var $69=HEAP32[((((76)|0))>>2)];
   var $70=(($69)|0);
   var $71=HEAP8[($70)];
   var $72=(($71 << 24) >> 24)!=0;
   if ($72) { label = 20; break; } else { label = 18; break; }
  case 18: 
   var $74=HEAP32[((((76)|0))>>2)];
   var $75=(($74+1)|0);
   var $76=HEAP8[($75)];
   var $77=(($76)&(255));
   var $78=(($77)|(0))!=63;
   if ($78) { label = 20; break; } else { label = 19; break; }
  case 19: 
   var $80=HEAP32[((((76)|0))>>2)];
   var $81=(($80+2)|0);
   var $82=HEAP8[($81)];
   var $83=(($82 << 24) >> 24)!=0;
   if ($83) { label = 20; break; } else { label = 22; break; }
  case 20: 
   label = 21; break;
  case 21: 
   HEAP32[((((72)|0))>>2)]=2;
   label = 56; break;
  case 22: 
   var $88=HEAP32[((((84)|0))>>2)];
   _njSkip($88);
   $mby=0;
   $mbx=0;
   label = 23; break;
  case 23: 
   $i=0;
   $c=((116)|0);
   label = 24; break;
  case 24: 
   var $91=$i;
   var $92=HEAP32[((((112)|0))>>2)];
   var $93=(($91)|(0)) < (($92)|(0));
   if ($93) { label = 25; break; } else { label = 39; break; }
  case 25: 
   $sby=0;
   label = 26; break;
  case 26: 
   var $96=$sby;
   var $97=$c;
   var $98=(($97+8)|0);
   var $99=HEAP32[(($98)>>2)];
   var $100=(($96)|(0)) < (($99)|(0));
   if ($100) { label = 27; break; } else { label = 37; break; }
  case 27: 
   $sbx=0;
   label = 28; break;
  case 28: 
   var $103=$sbx;
   var $104=$c;
   var $105=(($104+4)|0);
   var $106=HEAP32[(($105)>>2)];
   var $107=(($103)|(0)) < (($106)|(0));
   if ($107) { label = 29; break; } else { label = 35; break; }
  case 29: 
   var $109=$c;
   var $110=$mby;
   var $111=$c;
   var $112=(($111+8)|0);
   var $113=HEAP32[(($112)>>2)];
   var $114=(Math.imul($110,$113)|0);
   var $115=$sby;
   var $116=((($114)+($115))|0);
   var $117=$c;
   var $118=(($117+20)|0);
   var $119=HEAP32[(($118)>>2)];
   var $120=(Math.imul($116,$119)|0);
   var $121=$mbx;
   var $122=$c;
   var $123=(($122+4)|0);
   var $124=HEAP32[(($123)>>2)];
   var $125=(Math.imul($121,$124)|0);
   var $126=((($120)+($125))|0);
   var $127=$sbx;
   var $128=((($126)+($127))|0);
   var $129=$128 << 3;
   var $130=$c;
   var $131=(($130+40)|0);
   var $132=HEAP32[(($131)>>2)];
   var $133=(($132+$129)|0);
   _njDecodeBlock($109, $133);
   label = 30; break;
  case 30: 
   var $135=HEAP32[((((72)|0))>>2)];
   var $136=(($135)|(0))!=0;
   if ($136) { label = 31; break; } else { label = 32; break; }
  case 31: 
   label = 56; break;
  case 32: 
   label = 33; break;
  case 33: 
   label = 34; break;
  case 34: 
   var $141=$sbx;
   var $142=((($141)+(1))|0);
   $sbx=$142;
   label = 28; break;
  case 35: 
   label = 36; break;
  case 36: 
   var $145=$sby;
   var $146=((($145)+(1))|0);
   $sby=$146;
   label = 26; break;
  case 37: 
   label = 38; break;
  case 38: 
   var $149=$i;
   var $150=((($149)+(1))|0);
   $i=$150;
   var $151=$c;
   var $152=(($151+44)|0);
   $c=$152;
   label = 24; break;
  case 39: 
   var $154=$mbx;
   var $155=((($154)+(1))|0);
   $mbx=$155;
   var $156=HEAP32[((((96)|0))>>2)];
   var $157=(($155)|(0)) >= (($156)|(0));
   if ($157) { label = 40; break; } else { label = 43; break; }
  case 40: 
   $mbx=0;
   var $159=$mby;
   var $160=((($159)+(1))|0);
   $mby=$160;
   var $161=HEAP32[((((100)|0))>>2)];
   var $162=(($160)|(0)) >= (($161)|(0));
   if ($162) { label = 41; break; } else { label = 42; break; }
  case 41: 
   label = 55; break;
  case 42: 
   label = 43; break;
  case 43: 
   var $166=HEAP32[((((525064)|0))>>2)];
   var $167=(($166)|(0))!=0;
   if ($167) { label = 44; break; } else { label = 54; break; }
  case 44: 
   var $169=$rstcount;
   var $170=((($169)-(1))|0);
   $rstcount=$170;
   var $171=(($170)|(0))!=0;
   if ($171) { label = 54; break; } else { label = 45; break; }
  case 45: 
   _njByteAlign();
   var $173=_njGetBits(16);
   $i=$173;
   var $174=$i;
   var $175=$174 & 65528;
   var $176=(($175)|(0))!=65488;
   if ($176) { label = 47; break; } else { label = 46; break; }
  case 46: 
   var $178=$i;
   var $179=$178 & 7;
   var $180=$nextrst;
   var $181=(($179)|(0))!=(($180)|(0));
   if ($181) { label = 47; break; } else { label = 49; break; }
  case 47: 
   label = 48; break;
  case 48: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 56; break;
  case 49: 
   var $186=$nextrst;
   var $187=((($186)+(1))|0);
   var $188=$187 & 7;
   $nextrst=$188;
   var $189=HEAP32[((((525064)|0))>>2)];
   $rstcount=$189;
   $i=0;
   label = 50; break;
  case 50: 
   var $191=$i;
   var $192=(($191)|(0)) < 3;
   if ($192) { label = 51; break; } else { label = 53; break; }
  case 51: 
   var $194=$i;
   var $195=((((116)|0)+((($194)*(44))&-1))|0);
   var $196=(($195+36)|0);
   HEAP32[(($196)>>2)]=0;
   label = 52; break;
  case 52: 
   var $198=$i;
   var $199=((($198)+(1))|0);
   $i=$199;
   label = 50; break;
  case 53: 
   label = 54; break;
  case 54: 
   label = 23; break;
  case 55: 
   HEAP32[((((72)|0))>>2)]=6;
   label = 56; break;
  case 56: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njSkipMarker() {
 var label = 0;
 _njDecodeLength();
 var $1=HEAP32[((((84)|0))>>2)];
 _njSkip($1);
 return;
}
function _njConvert() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i;
   var $c;
   var $x;
   var $yy;
   var $prgb;
   var $py;
   var $pcb;
   var $pcr;
   var $y;
   var $cb;
   var $cr;
   var $pin;
   var $pout;
   var $y1;
   $i=0;
   $c=((116)|0);
   label = 2; break;
  case 2: 
   var $2=$i;
   var $3=HEAP32[((((112)|0))>>2)];
   var $4=(($2)|(0)) < (($3)|(0));
   if ($4) { label = 3; break; } else { label = 26; break; }
  case 3: 
   label = 4; break;
  case 4: 
   var $7=$c;
   var $8=(($7+12)|0);
   var $9=HEAP32[(($8)>>2)];
   var $10=HEAP32[((((88)|0))>>2)];
   var $11=(($9)|(0)) < (($10)|(0));
   if ($11) { var $19 = 1;label = 6; break; } else { label = 5; break; }
  case 5: 
   var $13=$c;
   var $14=(($13+16)|0);
   var $15=HEAP32[(($14)>>2)];
   var $16=HEAP32[((((92)|0))>>2)];
   var $17=(($15)|(0)) < (($16)|(0));
   var $19 = $17;label = 6; break;
  case 6: 
   var $19;
   if ($19) { label = 7; break; } else { label = 20; break; }
  case 7: 
   var $21=$c;
   var $22=(($21+12)|0);
   var $23=HEAP32[(($22)>>2)];
   var $24=HEAP32[((((88)|0))>>2)];
   var $25=(($23)|(0)) < (($24)|(0));
   if ($25) { label = 8; break; } else { label = 9; break; }
  case 8: 
   var $27=$c;
   _njUpsampleH($27);
   label = 9; break;
  case 9: 
   label = 10; break;
  case 10: 
   var $30=HEAP32[((((72)|0))>>2)];
   var $31=(($30)|(0))!=0;
   if ($31) { label = 11; break; } else { label = 12; break; }
  case 11: 
   label = 43; break;
  case 12: 
   label = 13; break;
  case 13: 
   var $35=$c;
   var $36=(($35+16)|0);
   var $37=HEAP32[(($36)>>2)];
   var $38=HEAP32[((((92)|0))>>2)];
   var $39=(($37)|(0)) < (($38)|(0));
   if ($39) { label = 14; break; } else { label = 15; break; }
  case 14: 
   var $41=$c;
   _njUpsampleV($41);
   label = 15; break;
  case 15: 
   label = 16; break;
  case 16: 
   var $44=HEAP32[((((72)|0))>>2)];
   var $45=(($44)|(0))!=0;
   if ($45) { label = 17; break; } else { label = 18; break; }
  case 17: 
   label = 43; break;
  case 18: 
   label = 19; break;
  case 19: 
   label = 4; break;
  case 20: 
   var $50=$c;
   var $51=(($50+12)|0);
   var $52=HEAP32[(($51)>>2)];
   var $53=HEAP32[((((88)|0))>>2)];
   var $54=(($52)|(0)) < (($53)|(0));
   if ($54) { label = 22; break; } else { label = 21; break; }
  case 21: 
   var $56=$c;
   var $57=(($56+16)|0);
   var $58=HEAP32[(($57)>>2)];
   var $59=HEAP32[((((92)|0))>>2)];
   var $60=(($58)|(0)) < (($59)|(0));
   if ($60) { label = 22; break; } else { label = 24; break; }
  case 22: 
   label = 23; break;
  case 23: 
   HEAP32[((((72)|0))>>2)]=4;
   label = 43; break;
  case 24: 
   label = 25; break;
  case 25: 
   var $66=$i;
   var $67=((($66)+(1))|0);
   $i=$67;
   var $68=$c;
   var $69=(($68+44)|0);
   $c=$69;
   label = 2; break;
  case 26: 
   var $71=HEAP32[((((112)|0))>>2)];
   var $72=(($71)|(0))==3;
   if ($72) { label = 27; break; } else { label = 36; break; }
  case 27: 
   var $74=HEAP32[((((525068)|0))>>2)];
   $prgb=$74;
   var $75=HEAP32[((((156)|0))>>2)];
   $py=$75;
   var $76=HEAP32[((((200)|0))>>2)];
   $pcb=$76;
   var $77=HEAP32[((((244)|0))>>2)];
   $pcr=$77;
   var $78=HEAP32[((((92)|0))>>2)];
   $yy=$78;
   label = 28; break;
  case 28: 
   var $80=$yy;
   var $81=(($80)|(0))!=0;
   if ($81) { label = 29; break; } else { label = 35; break; }
  case 29: 
   $x=0;
   label = 30; break;
  case 30: 
   var $84=$x;
   var $85=HEAP32[((((88)|0))>>2)];
   var $86=(($84)|(0)) < (($85)|(0));
   if ($86) { label = 31; break; } else { label = 33; break; }
  case 31: 
   var $88=$x;
   var $89=$py;
   var $90=(($89+$88)|0);
   var $91=HEAP8[($90)];
   var $92=(($91)&(255));
   var $93=$92 << 8;
   $y=$93;
   var $94=$x;
   var $95=$pcb;
   var $96=(($95+$94)|0);
   var $97=HEAP8[($96)];
   var $98=(($97)&(255));
   var $99=((($98)-(128))|0);
   $cb=$99;
   var $100=$x;
   var $101=$pcr;
   var $102=(($101+$100)|0);
   var $103=HEAP8[($102)];
   var $104=(($103)&(255));
   var $105=((($104)-(128))|0);
   $cr=$105;
   var $106=$y;
   var $107=$cr;
   var $108=((($107)*(359))&-1);
   var $109=((($106)+($108))|0);
   var $110=((($109)+(128))|0);
   var $111=$110 >> 8;
   var $112=_njClip($111);
   var $113=$prgb;
   var $114=(($113+1)|0);
   $prgb=$114;
   HEAP8[($113)]=$112;
   var $115=$y;
   var $116=$cb;
   var $117=((($116)*(88))&-1);
   var $118=((($115)-($117))|0);
   var $119=$cr;
   var $120=((($119)*(183))&-1);
   var $121=((($118)-($120))|0);
   var $122=((($121)+(128))|0);
   var $123=$122 >> 8;
   var $124=_njClip($123);
   var $125=$prgb;
   var $126=(($125+1)|0);
   $prgb=$126;
   HEAP8[($125)]=$124;
   var $127=$y;
   var $128=$cb;
   var $129=((($128)*(454))&-1);
   var $130=((($127)+($129))|0);
   var $131=((($130)+(128))|0);
   var $132=$131 >> 8;
   var $133=_njClip($132);
   var $134=$prgb;
   var $135=(($134+1)|0);
   $prgb=$135;
   HEAP8[($134)]=$133;
   label = 32; break;
  case 32: 
   var $137=$x;
   var $138=((($137)+(1))|0);
   $x=$138;
   label = 30; break;
  case 33: 
   var $140=HEAP32[((((136)|0))>>2)];
   var $141=$py;
   var $142=(($141+$140)|0);
   $py=$142;
   var $143=HEAP32[((((180)|0))>>2)];
   var $144=$pcb;
   var $145=(($144+$143)|0);
   $pcb=$145;
   var $146=HEAP32[((((224)|0))>>2)];
   var $147=$pcr;
   var $148=(($147+$146)|0);
   $pcr=$148;
   label = 34; break;
  case 34: 
   var $150=$yy;
   var $151=((($150)-(1))|0);
   $yy=$151;
   label = 28; break;
  case 35: 
   label = 43; break;
  case 36: 
   var $154=HEAP32[((((128)|0))>>2)];
   var $155=HEAP32[((((136)|0))>>2)];
   var $156=(($154)|(0))!=(($155)|(0));
   if ($156) { label = 37; break; } else { label = 42; break; }
  case 37: 
   var $158=HEAP32[((((136)|0))>>2)];
   var $159=HEAP32[((((156)|0))>>2)];
   var $160=(($159+$158)|0);
   $pin=$160;
   var $161=HEAP32[((((128)|0))>>2)];
   var $162=HEAP32[((((156)|0))>>2)];
   var $163=(($162+$161)|0);
   $pout=$163;
   var $164=HEAP32[((((132)|0))>>2)];
   var $165=((($164)-(1))|0);
   $y1=$165;
   label = 38; break;
  case 38: 
   var $167=$y1;
   var $168=(($167)|(0))!=0;
   if ($168) { label = 39; break; } else { label = 41; break; }
  case 39: 
   var $170=$pout;
   var $171=$pin;
   var $172=HEAP32[((((128)|0))>>2)];
   assert($172 % 1 === 0);(_memcpy($170, $171, $172)|0);
   var $173=HEAP32[((((136)|0))>>2)];
   var $174=$pin;
   var $175=(($174+$173)|0);
   $pin=$175;
   var $176=HEAP32[((((128)|0))>>2)];
   var $177=$pout;
   var $178=(($177+$176)|0);
   $pout=$178;
   label = 40; break;
  case 40: 
   var $180=$y1;
   var $181=((($180)-(1))|0);
   $y1=$181;
   label = 38; break;
  case 41: 
   var $183=HEAP32[((((128)|0))>>2)];
   HEAP32[((((136)|0))>>2)]=$183;
   label = 42; break;
  case 42: 
   label = 43; break;
  case 43: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _convert($jpgBuffer, $lengthOfFile, $resultBuffer, $widthPtr, $heightPtr) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $5;
   var $6;
   var $image;
   $2=$jpgBuffer;
   $3=$lengthOfFile;
   $4=$resultBuffer;
   $5=$widthPtr;
   $6=$heightPtr;
   _njInit();
   var $7=$2;
   var $8=$3;
   var $9=_njDecode($7, $8);
   var $10=(($9)|(0))!=0;
   if ($10) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $1=1;
   label = 4; break;
  case 3: 
   var $13=_njGetImage();
   $image=$13;
   var $14=$image;
   var $15=$4;
   HEAP32[(($15)>>2)]=$14;
   var $16=_njGetWidth();
   var $17=$5;
   HEAP32[(($17)>>2)]=$16;
   var $18=_njGetHeight();
   var $19=$6;
   HEAP32[(($19)>>2)]=$18;
   var $20=_njGetImageSize();
   $1=$20;
   label = 4; break;
  case 4: 
   var $22=$1;
   return $22;
  default: assert(0, "bad label: " + label);
 }
}
Module["_convert"] = _convert;
// WARNING: content after a branch in a label, line: 1887
// WARNING: content after a branch in a label, line: 2221
// WARNING: content after a branch in a label, line: 2583
// WARNING: content after a branch in a label, line: 2602
// WARNING: content after a branch in a label, line: 2698
// WARNING: content after a branch in a label, line: 2719
function _njClip($x) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   $1=$x;
   var $2=$1;
   var $3=(($2)|(0)) < 0;
   if ($3) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $16 = 0;label = 7; break;
  case 3: 
   var $6=$1;
   var $7=(($6)|(0)) > 255;
   if ($7) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $14 = 255;label = 6; break;
  case 5: 
   var $10=$1;
   var $11=(($10) & 255);
   var $12=(($11)&(255));
   var $14 = $12;label = 6; break;
  case 6: 
   var $14;
   var $16 = $14;label = 7; break;
  case 7: 
   var $16;
   var $17=(($16) & 255);
   return $17;
  default: assert(0, "bad label: " + label);
 }
}
function _njByteAlign() {
 var label = 0;
 var $1=HEAP32[((((524804)|0))>>2)];
 var $2=$1 & 248;
 HEAP32[((((524804)|0))>>2)]=$2;
 return;
}
function _njDecode16($pos) {
 var label = 0;
 var $1;
 $1=$pos;
 var $2=$1;
 var $3=(($2)|0);
 var $4=HEAP8[($3)];
 var $5=(($4)&(255));
 var $6=$5 << 8;
 var $7=$1;
 var $8=(($7+1)|0);
 var $9=HEAP8[($8)];
 var $10=(($9)&(255));
 var $11=$6 | $10;
 var $12=(($11) & 65535);
 return $12;
}
function _njUpsampleH($c) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $xmax;
   var $out;
   var $lin;
   var $lout;
   var $x;
   var $y;
   $1=$c;
   var $2=$1;
   var $3=(($2+12)|0);
   var $4=HEAP32[(($3)>>2)];
   var $5=((($4)-(3))|0);
   $xmax=$5;
   var $6=$1;
   var $7=(($6+12)|0);
   var $8=HEAP32[(($7)>>2)];
   var $9=$1;
   var $10=(($9+16)|0);
   var $11=HEAP32[(($10)>>2)];
   var $12=(Math.imul($8,$11)|0);
   var $13=$12 << 1;
   var $14=_malloc($13);
   $out=$14;
   var $15=$out;
   var $16=(($15)|(0))!=0;
   if ($16) { label = 4; break; } else { label = 2; break; }
  case 2: 
   label = 3; break;
  case 3: 
   HEAP32[((((72)|0))>>2)]=3;
   label = 13; break;
  case 4: 
   var $21=$1;
   var $22=(($21+40)|0);
   var $23=HEAP32[(($22)>>2)];
   $lin=$23;
   var $24=$out;
   $lout=$24;
   var $25=$1;
   var $26=(($25+16)|0);
   var $27=HEAP32[(($26)>>2)];
   $y=$27;
   label = 5; break;
  case 5: 
   var $29=$y;
   var $30=(($29)|(0))!=0;
   if ($30) { label = 6; break; } else { label = 12; break; }
  case 6: 
   var $32=$lin;
   var $33=(($32)|0);
   var $34=HEAP8[($33)];
   var $35=(($34)&(255));
   var $36=((($35)*(139))&-1);
   var $37=$lin;
   var $38=(($37+1)|0);
   var $39=HEAP8[($38)];
   var $40=(($39)&(255));
   var $41=((($40)*(-11))&-1);
   var $42=((($36)+($41))|0);
   var $43=((($42)+(64))|0);
   var $44=$43 >> 7;
   var $45=_njClip($44);
   var $46=$lout;
   var $47=(($46)|0);
   HEAP8[($47)]=$45;
   var $48=$lin;
   var $49=(($48)|0);
   var $50=HEAP8[($49)];
   var $51=(($50)&(255));
   var $52=((($51)*(104))&-1);
   var $53=$lin;
   var $54=(($53+1)|0);
   var $55=HEAP8[($54)];
   var $56=(($55)&(255));
   var $57=((($56)*(27))&-1);
   var $58=((($52)+($57))|0);
   var $59=$lin;
   var $60=(($59+2)|0);
   var $61=HEAP8[($60)];
   var $62=(($61)&(255));
   var $63=((($62)*(-3))&-1);
   var $64=((($58)+($63))|0);
   var $65=((($64)+(64))|0);
   var $66=$65 >> 7;
   var $67=_njClip($66);
   var $68=$lout;
   var $69=(($68+1)|0);
   HEAP8[($69)]=$67;
   var $70=$lin;
   var $71=(($70)|0);
   var $72=HEAP8[($71)];
   var $73=(($72)&(255));
   var $74=((($73)*(28))&-1);
   var $75=$lin;
   var $76=(($75+1)|0);
   var $77=HEAP8[($76)];
   var $78=(($77)&(255));
   var $79=((($78)*(109))&-1);
   var $80=((($74)+($79))|0);
   var $81=$lin;
   var $82=(($81+2)|0);
   var $83=HEAP8[($82)];
   var $84=(($83)&(255));
   var $85=((($84)*(-9))&-1);
   var $86=((($80)+($85))|0);
   var $87=((($86)+(64))|0);
   var $88=$87 >> 7;
   var $89=_njClip($88);
   var $90=$lout;
   var $91=(($90+2)|0);
   HEAP8[($91)]=$89;
   $x=0;
   label = 7; break;
  case 7: 
   var $93=$x;
   var $94=$xmax;
   var $95=(($93)|(0)) < (($94)|(0));
   if ($95) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $97=$x;
   var $98=$lin;
   var $99=(($98+$97)|0);
   var $100=HEAP8[($99)];
   var $101=(($100)&(255));
   var $102=((($101)*(-9))&-1);
   var $103=$x;
   var $104=((($103)+(1))|0);
   var $105=$lin;
   var $106=(($105+$104)|0);
   var $107=HEAP8[($106)];
   var $108=(($107)&(255));
   var $109=((($108)*(111))&-1);
   var $110=((($102)+($109))|0);
   var $111=$x;
   var $112=((($111)+(2))|0);
   var $113=$lin;
   var $114=(($113+$112)|0);
   var $115=HEAP8[($114)];
   var $116=(($115)&(255));
   var $117=((($116)*(29))&-1);
   var $118=((($110)+($117))|0);
   var $119=$x;
   var $120=((($119)+(3))|0);
   var $121=$lin;
   var $122=(($121+$120)|0);
   var $123=HEAP8[($122)];
   var $124=(($123)&(255));
   var $125=((($124)*(-3))&-1);
   var $126=((($118)+($125))|0);
   var $127=((($126)+(64))|0);
   var $128=$127 >> 7;
   var $129=_njClip($128);
   var $130=$x;
   var $131=$130 << 1;
   var $132=((($131)+(3))|0);
   var $133=$lout;
   var $134=(($133+$132)|0);
   HEAP8[($134)]=$129;
   var $135=$x;
   var $136=$lin;
   var $137=(($136+$135)|0);
   var $138=HEAP8[($137)];
   var $139=(($138)&(255));
   var $140=((($139)*(-3))&-1);
   var $141=$x;
   var $142=((($141)+(1))|0);
   var $143=$lin;
   var $144=(($143+$142)|0);
   var $145=HEAP8[($144)];
   var $146=(($145)&(255));
   var $147=((($146)*(29))&-1);
   var $148=((($140)+($147))|0);
   var $149=$x;
   var $150=((($149)+(2))|0);
   var $151=$lin;
   var $152=(($151+$150)|0);
   var $153=HEAP8[($152)];
   var $154=(($153)&(255));
   var $155=((($154)*(111))&-1);
   var $156=((($148)+($155))|0);
   var $157=$x;
   var $158=((($157)+(3))|0);
   var $159=$lin;
   var $160=(($159+$158)|0);
   var $161=HEAP8[($160)];
   var $162=(($161)&(255));
   var $163=((($162)*(-9))&-1);
   var $164=((($156)+($163))|0);
   var $165=((($164)+(64))|0);
   var $166=$165 >> 7;
   var $167=_njClip($166);
   var $168=$x;
   var $169=$168 << 1;
   var $170=((($169)+(4))|0);
   var $171=$lout;
   var $172=(($171+$170)|0);
   HEAP8[($172)]=$167;
   label = 9; break;
  case 9: 
   var $174=$x;
   var $175=((($174)+(1))|0);
   $x=$175;
   label = 7; break;
  case 10: 
   var $177=$1;
   var $178=(($177+20)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=$lin;
   var $181=(($180+$179)|0);
   $lin=$181;
   var $182=$1;
   var $183=(($182+12)|0);
   var $184=HEAP32[(($183)>>2)];
   var $185=$184 << 1;
   var $186=$lout;
   var $187=(($186+$185)|0);
   $lout=$187;
   var $188=$lin;
   var $189=((($188)-(1))|0);
   var $190=HEAP8[($189)];
   var $191=(($190)&(255));
   var $192=((($191)*(28))&-1);
   var $193=$lin;
   var $194=((($193)-(2))|0);
   var $195=HEAP8[($194)];
   var $196=(($195)&(255));
   var $197=((($196)*(109))&-1);
   var $198=((($192)+($197))|0);
   var $199=$lin;
   var $200=((($199)-(3))|0);
   var $201=HEAP8[($200)];
   var $202=(($201)&(255));
   var $203=((($202)*(-9))&-1);
   var $204=((($198)+($203))|0);
   var $205=((($204)+(64))|0);
   var $206=$205 >> 7;
   var $207=_njClip($206);
   var $208=$lout;
   var $209=((($208)-(3))|0);
   HEAP8[($209)]=$207;
   var $210=$lin;
   var $211=((($210)-(1))|0);
   var $212=HEAP8[($211)];
   var $213=(($212)&(255));
   var $214=((($213)*(104))&-1);
   var $215=$lin;
   var $216=((($215)-(2))|0);
   var $217=HEAP8[($216)];
   var $218=(($217)&(255));
   var $219=((($218)*(27))&-1);
   var $220=((($214)+($219))|0);
   var $221=$lin;
   var $222=((($221)-(3))|0);
   var $223=HEAP8[($222)];
   var $224=(($223)&(255));
   var $225=((($224)*(-3))&-1);
   var $226=((($220)+($225))|0);
   var $227=((($226)+(64))|0);
   var $228=$227 >> 7;
   var $229=_njClip($228);
   var $230=$lout;
   var $231=((($230)-(2))|0);
   HEAP8[($231)]=$229;
   var $232=$lin;
   var $233=((($232)-(1))|0);
   var $234=HEAP8[($233)];
   var $235=(($234)&(255));
   var $236=((($235)*(139))&-1);
   var $237=$lin;
   var $238=((($237)-(2))|0);
   var $239=HEAP8[($238)];
   var $240=(($239)&(255));
   var $241=((($240)*(-11))&-1);
   var $242=((($236)+($241))|0);
   var $243=((($242)+(64))|0);
   var $244=$243 >> 7;
   var $245=_njClip($244);
   var $246=$lout;
   var $247=((($246)-(1))|0);
   HEAP8[($247)]=$245;
   label = 11; break;
  case 11: 
   var $249=$y;
   var $250=((($249)-(1))|0);
   $y=$250;
   label = 5; break;
  case 12: 
   var $252=$1;
   var $253=(($252+12)|0);
   var $254=HEAP32[(($253)>>2)];
   var $255=$254 << 1;
   HEAP32[(($253)>>2)]=$255;
   var $256=$1;
   var $257=(($256+12)|0);
   var $258=HEAP32[(($257)>>2)];
   var $259=$1;
   var $260=(($259+20)|0);
   HEAP32[(($260)>>2)]=$258;
   var $261=$1;
   var $262=(($261+40)|0);
   var $263=HEAP32[(($262)>>2)];
   _free($263);
   var $264=$out;
   var $265=$1;
   var $266=(($265+40)|0);
   HEAP32[(($266)>>2)]=$264;
   label = 13; break;
  case 13: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njUpsampleV($c) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $w;
   var $s1;
   var $s2;
   var $out;
   var $cin;
   var $cout;
   var $x;
   var $y;
   $1=$c;
   var $2=$1;
   var $3=(($2+12)|0);
   var $4=HEAP32[(($3)>>2)];
   $w=$4;
   var $5=$1;
   var $6=(($5+20)|0);
   var $7=HEAP32[(($6)>>2)];
   $s1=$7;
   var $8=$s1;
   var $9=$s1;
   var $10=((($8)+($9))|0);
   $s2=$10;
   var $11=$1;
   var $12=(($11+12)|0);
   var $13=HEAP32[(($12)>>2)];
   var $14=$1;
   var $15=(($14+16)|0);
   var $16=HEAP32[(($15)>>2)];
   var $17=(Math.imul($13,$16)|0);
   var $18=$17 << 1;
   var $19=_malloc($18);
   $out=$19;
   var $20=$out;
   var $21=(($20)|(0))!=0;
   if ($21) { label = 4; break; } else { label = 2; break; }
  case 2: 
   label = 3; break;
  case 3: 
   HEAP32[((((72)|0))>>2)]=3;
   label = 13; break;
  case 4: 
   $x=0;
   label = 5; break;
  case 5: 
   var $27=$x;
   var $28=$w;
   var $29=(($27)|(0)) < (($28)|(0));
   if ($29) { label = 6; break; } else { label = 12; break; }
  case 6: 
   var $31=$x;
   var $32=$1;
   var $33=(($32+40)|0);
   var $34=HEAP32[(($33)>>2)];
   var $35=(($34+$31)|0);
   $cin=$35;
   var $36=$x;
   var $37=$out;
   var $38=(($37+$36)|0);
   $cout=$38;
   var $39=$cin;
   var $40=(($39)|0);
   var $41=HEAP8[($40)];
   var $42=(($41)&(255));
   var $43=((($42)*(139))&-1);
   var $44=$s1;
   var $45=$cin;
   var $46=(($45+$44)|0);
   var $47=HEAP8[($46)];
   var $48=(($47)&(255));
   var $49=((($48)*(-11))&-1);
   var $50=((($43)+($49))|0);
   var $51=((($50)+(64))|0);
   var $52=$51 >> 7;
   var $53=_njClip($52);
   var $54=$cout;
   HEAP8[($54)]=$53;
   var $55=$w;
   var $56=$cout;
   var $57=(($56+$55)|0);
   $cout=$57;
   var $58=$cin;
   var $59=(($58)|0);
   var $60=HEAP8[($59)];
   var $61=(($60)&(255));
   var $62=((($61)*(104))&-1);
   var $63=$s1;
   var $64=$cin;
   var $65=(($64+$63)|0);
   var $66=HEAP8[($65)];
   var $67=(($66)&(255));
   var $68=((($67)*(27))&-1);
   var $69=((($62)+($68))|0);
   var $70=$s2;
   var $71=$cin;
   var $72=(($71+$70)|0);
   var $73=HEAP8[($72)];
   var $74=(($73)&(255));
   var $75=((($74)*(-3))&-1);
   var $76=((($69)+($75))|0);
   var $77=((($76)+(64))|0);
   var $78=$77 >> 7;
   var $79=_njClip($78);
   var $80=$cout;
   HEAP8[($80)]=$79;
   var $81=$w;
   var $82=$cout;
   var $83=(($82+$81)|0);
   $cout=$83;
   var $84=$cin;
   var $85=(($84)|0);
   var $86=HEAP8[($85)];
   var $87=(($86)&(255));
   var $88=((($87)*(28))&-1);
   var $89=$s1;
   var $90=$cin;
   var $91=(($90+$89)|0);
   var $92=HEAP8[($91)];
   var $93=(($92)&(255));
   var $94=((($93)*(109))&-1);
   var $95=((($88)+($94))|0);
   var $96=$s2;
   var $97=$cin;
   var $98=(($97+$96)|0);
   var $99=HEAP8[($98)];
   var $100=(($99)&(255));
   var $101=((($100)*(-9))&-1);
   var $102=((($95)+($101))|0);
   var $103=((($102)+(64))|0);
   var $104=$103 >> 7;
   var $105=_njClip($104);
   var $106=$cout;
   HEAP8[($106)]=$105;
   var $107=$w;
   var $108=$cout;
   var $109=(($108+$107)|0);
   $cout=$109;
   var $110=$s1;
   var $111=$cin;
   var $112=(($111+$110)|0);
   $cin=$112;
   var $113=$1;
   var $114=(($113+16)|0);
   var $115=HEAP32[(($114)>>2)];
   var $116=((($115)-(3))|0);
   $y=$116;
   label = 7; break;
  case 7: 
   var $118=$y;
   var $119=(($118)|(0))!=0;
   if ($119) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $121=$s1;
   var $122=(((-$121))|0);
   var $123=$cin;
   var $124=(($123+$122)|0);
   var $125=HEAP8[($124)];
   var $126=(($125)&(255));
   var $127=((($126)*(-9))&-1);
   var $128=$cin;
   var $129=(($128)|0);
   var $130=HEAP8[($129)];
   var $131=(($130)&(255));
   var $132=((($131)*(111))&-1);
   var $133=((($127)+($132))|0);
   var $134=$s1;
   var $135=$cin;
   var $136=(($135+$134)|0);
   var $137=HEAP8[($136)];
   var $138=(($137)&(255));
   var $139=((($138)*(29))&-1);
   var $140=((($133)+($139))|0);
   var $141=$s2;
   var $142=$cin;
   var $143=(($142+$141)|0);
   var $144=HEAP8[($143)];
   var $145=(($144)&(255));
   var $146=((($145)*(-3))&-1);
   var $147=((($140)+($146))|0);
   var $148=((($147)+(64))|0);
   var $149=$148 >> 7;
   var $150=_njClip($149);
   var $151=$cout;
   HEAP8[($151)]=$150;
   var $152=$w;
   var $153=$cout;
   var $154=(($153+$152)|0);
   $cout=$154;
   var $155=$s1;
   var $156=(((-$155))|0);
   var $157=$cin;
   var $158=(($157+$156)|0);
   var $159=HEAP8[($158)];
   var $160=(($159)&(255));
   var $161=((($160)*(-3))&-1);
   var $162=$cin;
   var $163=(($162)|0);
   var $164=HEAP8[($163)];
   var $165=(($164)&(255));
   var $166=((($165)*(29))&-1);
   var $167=((($161)+($166))|0);
   var $168=$s1;
   var $169=$cin;
   var $170=(($169+$168)|0);
   var $171=HEAP8[($170)];
   var $172=(($171)&(255));
   var $173=((($172)*(111))&-1);
   var $174=((($167)+($173))|0);
   var $175=$s2;
   var $176=$cin;
   var $177=(($176+$175)|0);
   var $178=HEAP8[($177)];
   var $179=(($178)&(255));
   var $180=((($179)*(-9))&-1);
   var $181=((($174)+($180))|0);
   var $182=((($181)+(64))|0);
   var $183=$182 >> 7;
   var $184=_njClip($183);
   var $185=$cout;
   HEAP8[($185)]=$184;
   var $186=$w;
   var $187=$cout;
   var $188=(($187+$186)|0);
   $cout=$188;
   var $189=$s1;
   var $190=$cin;
   var $191=(($190+$189)|0);
   $cin=$191;
   label = 9; break;
  case 9: 
   var $193=$y;
   var $194=((($193)-(1))|0);
   $y=$194;
   label = 7; break;
  case 10: 
   var $196=$s1;
   var $197=$cin;
   var $198=(($197+$196)|0);
   $cin=$198;
   var $199=$cin;
   var $200=(($199)|0);
   var $201=HEAP8[($200)];
   var $202=(($201)&(255));
   var $203=((($202)*(28))&-1);
   var $204=$s1;
   var $205=(((-$204))|0);
   var $206=$cin;
   var $207=(($206+$205)|0);
   var $208=HEAP8[($207)];
   var $209=(($208)&(255));
   var $210=((($209)*(109))&-1);
   var $211=((($203)+($210))|0);
   var $212=$s2;
   var $213=(((-$212))|0);
   var $214=$cin;
   var $215=(($214+$213)|0);
   var $216=HEAP8[($215)];
   var $217=(($216)&(255));
   var $218=((($217)*(-9))&-1);
   var $219=((($211)+($218))|0);
   var $220=((($219)+(64))|0);
   var $221=$220 >> 7;
   var $222=_njClip($221);
   var $223=$cout;
   HEAP8[($223)]=$222;
   var $224=$w;
   var $225=$cout;
   var $226=(($225+$224)|0);
   $cout=$226;
   var $227=$cin;
   var $228=(($227)|0);
   var $229=HEAP8[($228)];
   var $230=(($229)&(255));
   var $231=((($230)*(104))&-1);
   var $232=$s1;
   var $233=(((-$232))|0);
   var $234=$cin;
   var $235=(($234+$233)|0);
   var $236=HEAP8[($235)];
   var $237=(($236)&(255));
   var $238=((($237)*(27))&-1);
   var $239=((($231)+($238))|0);
   var $240=$s2;
   var $241=(((-$240))|0);
   var $242=$cin;
   var $243=(($242+$241)|0);
   var $244=HEAP8[($243)];
   var $245=(($244)&(255));
   var $246=((($245)*(-3))&-1);
   var $247=((($239)+($246))|0);
   var $248=((($247)+(64))|0);
   var $249=$248 >> 7;
   var $250=_njClip($249);
   var $251=$cout;
   HEAP8[($251)]=$250;
   var $252=$w;
   var $253=$cout;
   var $254=(($253+$252)|0);
   $cout=$254;
   var $255=$cin;
   var $256=(($255)|0);
   var $257=HEAP8[($256)];
   var $258=(($257)&(255));
   var $259=((($258)*(139))&-1);
   var $260=$s1;
   var $261=(((-$260))|0);
   var $262=$cin;
   var $263=(($262+$261)|0);
   var $264=HEAP8[($263)];
   var $265=(($264)&(255));
   var $266=((($265)*(-11))&-1);
   var $267=((($259)+($266))|0);
   var $268=((($267)+(64))|0);
   var $269=$268 >> 7;
   var $270=_njClip($269);
   var $271=$cout;
   HEAP8[($271)]=$270;
   label = 11; break;
  case 11: 
   var $273=$x;
   var $274=((($273)+(1))|0);
   $x=$274;
   label = 5; break;
  case 12: 
   var $276=$1;
   var $277=(($276+16)|0);
   var $278=HEAP32[(($277)>>2)];
   var $279=$278 << 1;
   HEAP32[(($277)>>2)]=$279;
   var $280=$1;
   var $281=(($280+12)|0);
   var $282=HEAP32[(($281)>>2)];
   var $283=$1;
   var $284=(($283+20)|0);
   HEAP32[(($284)>>2)]=$282;
   var $285=$1;
   var $286=(($285+40)|0);
   var $287=HEAP32[(($286)>>2)];
   _free($287);
   var $288=$out;
   var $289=$1;
   var $290=(($289+40)|0);
   HEAP32[(($290)>>2)]=$288;
   label = 13; break;
  case 13: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecodeLength() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=HEAP32[((((80)|0))>>2)];
   var $2=(($1)|(0)) < 2;
   if ($2) { label = 2; break; } else { label = 4; break; }
  case 2: 
   label = 3; break;
  case 3: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 8; break;
  case 4: 
   var $7=HEAP32[((((76)|0))>>2)];
   var $8=_njDecode16($7);
   var $9=(($8)&(65535));
   HEAP32[((((84)|0))>>2)]=$9;
   var $10=HEAP32[((((84)|0))>>2)];
   var $11=HEAP32[((((80)|0))>>2)];
   var $12=(($10)|(0)) > (($11)|(0));
   if ($12) { label = 5; break; } else { label = 7; break; }
  case 5: 
   label = 6; break;
  case 6: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 8; break;
  case 7: 
   _njSkip(2);
   label = 8; break;
  case 8: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njDecodeBlock($c, $out) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $code=sp;
   var $value;
   var $coef;
   $1=$c;
   $2=$out;
   HEAP8[($code)]=0;
   $coef=0;
   _memset((((524808)|0)), 0, 256);
   var $3=$1;
   var $4=(($3+32)|0);
   var $5=HEAP32[(($4)>>2)];
   var $6=((((512)|0)+($5<<17))|0);
   var $7=(($6)|0);
   var $8=_njGetVLC($7, 0);
   var $9=$1;
   var $10=(($9+36)|0);
   var $11=HEAP32[(($10)>>2)];
   var $12=((($11)+($8))|0);
   HEAP32[(($10)>>2)]=$12;
   var $13=$1;
   var $14=(($13+36)|0);
   var $15=HEAP32[(($14)>>2)];
   var $16=$1;
   var $17=(($16+24)|0);
   var $18=HEAP32[(($17)>>2)];
   var $19=((((256)|0)+($18<<6))|0);
   var $20=(($19)|0);
   var $21=HEAP8[($20)];
   var $22=(($21)&(255));
   var $23=(Math.imul($15,$22)|0);
   HEAP32[((((524808)|0))>>2)]=$23;
   label = 2; break;
  case 2: 
   var $25=$1;
   var $26=(($25+28)|0);
   var $27=HEAP32[(($26)>>2)];
   var $28=((((512)|0)+($27<<17))|0);
   var $29=(($28)|0);
   var $30=_njGetVLC($29, $code);
   $value=$30;
   var $31=HEAP8[($code)];
   var $32=(($31 << 24) >> 24)!=0;
   if ($32) { label = 4; break; } else { label = 3; break; }
  case 3: 
   label = 13; break;
  case 4: 
   var $35=HEAP8[($code)];
   var $36=(($35)&(255));
   var $37=$36 & 15;
   var $38=(($37)|(0))!=0;
   if ($38) { label = 8; break; } else { label = 5; break; }
  case 5: 
   var $40=HEAP8[($code)];
   var $41=(($40)&(255));
   var $42=(($41)|(0))!=240;
   if ($42) { label = 6; break; } else { label = 8; break; }
  case 6: 
   label = 7; break;
  case 7: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 21; break;
  case 8: 
   var $47=HEAP8[($code)];
   var $48=(($47)&(255));
   var $49=$48 >> 4;
   var $50=((($49)+(1))|0);
   var $51=$coef;
   var $52=((($51)+($50))|0);
   $coef=$52;
   var $53=$coef;
   var $54=(($53)|(0)) > 63;
   if ($54) { label = 9; break; } else { label = 11; break; }
  case 9: 
   label = 10; break;
  case 10: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 21; break;
  case 11: 
   var $59=$value;
   var $60=$coef;
   var $61=$1;
   var $62=(($61+24)|0);
   var $63=HEAP32[(($62)>>2)];
   var $64=((((256)|0)+($63<<6))|0);
   var $65=(($64+$60)|0);
   var $66=HEAP8[($65)];
   var $67=(($66)&(255));
   var $68=(Math.imul($59,$67)|0);
   var $69=$coef;
   var $70=((8+$69)|0);
   var $71=HEAP8[($70)];
   var $72=(($71 << 24) >> 24);
   var $73=((((524808)|0)+($72<<2))|0);
   HEAP32[(($73)>>2)]=$68;
   label = 12; break;
  case 12: 
   var $75=$coef;
   var $76=(($75)|(0)) < 63;
   if ($76) { label = 2; break; } else { label = 13; break; }
  case 13: 
   $coef=0;
   label = 14; break;
  case 14: 
   var $79=$coef;
   var $80=(($79)|(0)) < 64;
   if ($80) { label = 15; break; } else { label = 17; break; }
  case 15: 
   var $82=$coef;
   var $83=((((524808)|0)+($82<<2))|0);
   _njRowIDCT($83);
   label = 16; break;
  case 16: 
   var $85=$coef;
   var $86=((($85)+(8))|0);
   $coef=$86;
   label = 14; break;
  case 17: 
   $coef=0;
   label = 18; break;
  case 18: 
   var $89=$coef;
   var $90=(($89)|(0)) < 8;
   if ($90) { label = 19; break; } else { label = 21; break; }
  case 19: 
   var $92=$coef;
   var $93=((((524808)|0)+($92<<2))|0);
   var $94=$coef;
   var $95=$2;
   var $96=(($95+$94)|0);
   var $97=$1;
   var $98=(($97+20)|0);
   var $99=HEAP32[(($98)>>2)];
   _njColIDCT($93, $96, $99);
   label = 20; break;
  case 20: 
   var $101=$coef;
   var $102=((($101)+(1))|0);
   $coef=$102;
   label = 18; break;
  case 21: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njGetBits($bits) {
 var label = 0;
 var $1;
 var $res;
 $1=$bits;
 var $2=$1;
 var $3=_njShowBits($2);
 $res=$3;
 var $4=$1;
 _njSkipBits($4);
 var $5=$res;
 return $5;
}
function _njShowBits($bits) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $newbyte;
   var $marker;
   $2=$bits;
   var $3=$2;
   var $4=(($3)|(0))!=0;
   if ($4) { label = 3; break; } else { label = 2; break; }
  case 2: 
   $1=0;
   label = 21; break;
  case 3: 
   label = 4; break;
  case 4: 
   var $8=HEAP32[((((524804)|0))>>2)];
   var $9=$2;
   var $10=(($8)|(0)) < (($9)|(0));
   if ($10) { label = 5; break; } else { label = 20; break; }
  case 5: 
   var $12=HEAP32[((((80)|0))>>2)];
   var $13=(($12)|(0)) <= 0;
   if ($13) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $15=HEAP32[((((524800)|0))>>2)];
   var $16=$15 << 8;
   var $17=$16 | 255;
   HEAP32[((((524800)|0))>>2)]=$17;
   var $18=HEAP32[((((524804)|0))>>2)];
   var $19=((($18)+(8))|0);
   HEAP32[((((524804)|0))>>2)]=$19;
   label = 4; break;
  case 7: 
   var $21=HEAP32[((((76)|0))>>2)];
   var $22=(($21+1)|0);
   HEAP32[((((76)|0))>>2)]=$22;
   var $23=HEAP8[($21)];
   $newbyte=$23;
   var $24=HEAP32[((((80)|0))>>2)];
   var $25=((($24)-(1))|0);
   HEAP32[((((80)|0))>>2)]=$25;
   var $26=HEAP32[((((524804)|0))>>2)];
   var $27=((($26)+(8))|0);
   HEAP32[((((524804)|0))>>2)]=$27;
   var $28=HEAP32[((((524800)|0))>>2)];
   var $29=$28 << 8;
   var $30=$newbyte;
   var $31=(($30)&(255));
   var $32=$29 | $31;
   HEAP32[((((524800)|0))>>2)]=$32;
   var $33=$newbyte;
   var $34=(($33)&(255));
   var $35=(($34)|(0))==255;
   if ($35) { label = 8; break; } else { label = 19; break; }
  case 8: 
   var $37=HEAP32[((((80)|0))>>2)];
   var $38=(($37)|(0))!=0;
   if ($38) { label = 9; break; } else { label = 17; break; }
  case 9: 
   var $40=HEAP32[((((76)|0))>>2)];
   var $41=(($40+1)|0);
   HEAP32[((((76)|0))>>2)]=$41;
   var $42=HEAP8[($40)];
   $marker=$42;
   var $43=HEAP32[((((80)|0))>>2)];
   var $44=((($43)-(1))|0);
   HEAP32[((((80)|0))>>2)]=$44;
   var $45=$marker;
   var $46=(($45)&(255));
   if ((($46)|(0))==0 | (($46)|(0))==255) {
    label = 10; break;
   }
   else if ((($46)|(0))==217) {
    label = 11; break;
   }
   else {
   label = 12; break;
   }
  case 10: 
   label = 16; break;
  case 11: 
   HEAP32[((((80)|0))>>2)]=0;
   label = 16; break;
  case 12: 
   var $50=$marker;
   var $51=(($50)&(255));
   var $52=$51 & 248;
   var $53=(($52)|(0))!=208;
   if ($53) { label = 13; break; } else { label = 14; break; }
  case 13: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 15; break;
  case 14: 
   var $56=HEAP32[((((524800)|0))>>2)];
   var $57=$56 << 8;
   var $58=$marker;
   var $59=(($58)&(255));
   var $60=$57 | $59;
   HEAP32[((((524800)|0))>>2)]=$60;
   var $61=HEAP32[((((524804)|0))>>2)];
   var $62=((($61)+(8))|0);
   HEAP32[((((524804)|0))>>2)]=$62;
   label = 15; break;
  case 15: 
   label = 16; break;
  case 16: 
   label = 18; break;
  case 17: 
   HEAP32[((((72)|0))>>2)]=5;
   label = 18; break;
  case 18: 
   label = 19; break;
  case 19: 
   label = 4; break;
  case 20: 
   var $69=HEAP32[((((524800)|0))>>2)];
   var $70=HEAP32[((((524804)|0))>>2)];
   var $71=$2;
   var $72=((($70)-($71))|0);
   var $73=$69 >> (($72)|(0));
   var $74=$2;
   var $75=1 << $74;
   var $76=((($75)-(1))|0);
   var $77=$73 & $76;
   $1=$77;
   label = 21; break;
  case 21: 
   var $79=$1;
   return $79;
  default: assert(0, "bad label: " + label);
 }
}
function _njRowIDCT($blk) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $x0;
   var $x1;
   var $x2;
   var $x3;
   var $x4;
   var $x5;
   var $x6;
   var $x7;
   var $x8;
   $1=$blk;
   var $2=$1;
   var $3=(($2+16)|0);
   var $4=HEAP32[(($3)>>2)];
   var $5=$4 << 11;
   $x1=$5;
   var $6=$1;
   var $7=(($6+24)|0);
   var $8=HEAP32[(($7)>>2)];
   $x2=$8;
   var $9=$5 | $8;
   var $10=$1;
   var $11=(($10+8)|0);
   var $12=HEAP32[(($11)>>2)];
   $x3=$12;
   var $13=$9 | $12;
   var $14=$1;
   var $15=(($14+4)|0);
   var $16=HEAP32[(($15)>>2)];
   $x4=$16;
   var $17=$13 | $16;
   var $18=$1;
   var $19=(($18+28)|0);
   var $20=HEAP32[(($19)>>2)];
   $x5=$20;
   var $21=$17 | $20;
   var $22=$1;
   var $23=(($22+20)|0);
   var $24=HEAP32[(($23)>>2)];
   $x6=$24;
   var $25=$21 | $24;
   var $26=$1;
   var $27=(($26+12)|0);
   var $28=HEAP32[(($27)>>2)];
   $x7=$28;
   var $29=$25 | $28;
   var $30=(($29)|(0))!=0;
   if ($30) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $32=$1;
   var $33=(($32)|0);
   var $34=HEAP32[(($33)>>2)];
   var $35=$34 << 3;
   var $36=$1;
   var $37=(($36+28)|0);
   HEAP32[(($37)>>2)]=$35;
   var $38=$1;
   var $39=(($38+24)|0);
   HEAP32[(($39)>>2)]=$35;
   var $40=$1;
   var $41=(($40+20)|0);
   HEAP32[(($41)>>2)]=$35;
   var $42=$1;
   var $43=(($42+16)|0);
   HEAP32[(($43)>>2)]=$35;
   var $44=$1;
   var $45=(($44+12)|0);
   HEAP32[(($45)>>2)]=$35;
   var $46=$1;
   var $47=(($46+8)|0);
   HEAP32[(($47)>>2)]=$35;
   var $48=$1;
   var $49=(($48+4)|0);
   HEAP32[(($49)>>2)]=$35;
   var $50=$1;
   var $51=(($50)|0);
   HEAP32[(($51)>>2)]=$35;
   label = 4; break;
  case 3: 
   var $53=$1;
   var $54=(($53)|0);
   var $55=HEAP32[(($54)>>2)];
   var $56=$55 << 11;
   var $57=((($56)+(128))|0);
   $x0=$57;
   var $58=$x4;
   var $59=$x5;
   var $60=((($58)+($59))|0);
   var $61=((($60)*(565))&-1);
   $x8=$61;
   var $62=$x8;
   var $63=$x4;
   var $64=((($63)*(2276))&-1);
   var $65=((($62)+($64))|0);
   $x4=$65;
   var $66=$x8;
   var $67=$x5;
   var $68=((($67)*(3406))&-1);
   var $69=((($66)-($68))|0);
   $x5=$69;
   var $70=$x6;
   var $71=$x7;
   var $72=((($70)+($71))|0);
   var $73=((($72)*(2408))&-1);
   $x8=$73;
   var $74=$x8;
   var $75=$x6;
   var $76=((($75)*(799))&-1);
   var $77=((($74)-($76))|0);
   $x6=$77;
   var $78=$x8;
   var $79=$x7;
   var $80=((($79)*(4017))&-1);
   var $81=((($78)-($80))|0);
   $x7=$81;
   var $82=$x0;
   var $83=$x1;
   var $84=((($82)+($83))|0);
   $x8=$84;
   var $85=$x1;
   var $86=$x0;
   var $87=((($86)-($85))|0);
   $x0=$87;
   var $88=$x3;
   var $89=$x2;
   var $90=((($88)+($89))|0);
   var $91=((($90)*(1108))&-1);
   $x1=$91;
   var $92=$x1;
   var $93=$x2;
   var $94=((($93)*(3784))&-1);
   var $95=((($92)-($94))|0);
   $x2=$95;
   var $96=$x1;
   var $97=$x3;
   var $98=((($97)*(1568))&-1);
   var $99=((($96)+($98))|0);
   $x3=$99;
   var $100=$x4;
   var $101=$x6;
   var $102=((($100)+($101))|0);
   $x1=$102;
   var $103=$x6;
   var $104=$x4;
   var $105=((($104)-($103))|0);
   $x4=$105;
   var $106=$x5;
   var $107=$x7;
   var $108=((($106)+($107))|0);
   $x6=$108;
   var $109=$x7;
   var $110=$x5;
   var $111=((($110)-($109))|0);
   $x5=$111;
   var $112=$x8;
   var $113=$x3;
   var $114=((($112)+($113))|0);
   $x7=$114;
   var $115=$x3;
   var $116=$x8;
   var $117=((($116)-($115))|0);
   $x8=$117;
   var $118=$x0;
   var $119=$x2;
   var $120=((($118)+($119))|0);
   $x3=$120;
   var $121=$x2;
   var $122=$x0;
   var $123=((($122)-($121))|0);
   $x0=$123;
   var $124=$x4;
   var $125=$x5;
   var $126=((($124)+($125))|0);
   var $127=((($126)*(181))&-1);
   var $128=((($127)+(128))|0);
   var $129=$128 >> 8;
   $x2=$129;
   var $130=$x4;
   var $131=$x5;
   var $132=((($130)-($131))|0);
   var $133=((($132)*(181))&-1);
   var $134=((($133)+(128))|0);
   var $135=$134 >> 8;
   $x4=$135;
   var $136=$x7;
   var $137=$x1;
   var $138=((($136)+($137))|0);
   var $139=$138 >> 8;
   var $140=$1;
   var $141=(($140)|0);
   HEAP32[(($141)>>2)]=$139;
   var $142=$x3;
   var $143=$x2;
   var $144=((($142)+($143))|0);
   var $145=$144 >> 8;
   var $146=$1;
   var $147=(($146+4)|0);
   HEAP32[(($147)>>2)]=$145;
   var $148=$x0;
   var $149=$x4;
   var $150=((($148)+($149))|0);
   var $151=$150 >> 8;
   var $152=$1;
   var $153=(($152+8)|0);
   HEAP32[(($153)>>2)]=$151;
   var $154=$x8;
   var $155=$x6;
   var $156=((($154)+($155))|0);
   var $157=$156 >> 8;
   var $158=$1;
   var $159=(($158+12)|0);
   HEAP32[(($159)>>2)]=$157;
   var $160=$x8;
   var $161=$x6;
   var $162=((($160)-($161))|0);
   var $163=$162 >> 8;
   var $164=$1;
   var $165=(($164+16)|0);
   HEAP32[(($165)>>2)]=$163;
   var $166=$x0;
   var $167=$x4;
   var $168=((($166)-($167))|0);
   var $169=$168 >> 8;
   var $170=$1;
   var $171=(($170+20)|0);
   HEAP32[(($171)>>2)]=$169;
   var $172=$x3;
   var $173=$x2;
   var $174=((($172)-($173))|0);
   var $175=$174 >> 8;
   var $176=$1;
   var $177=(($176+24)|0);
   HEAP32[(($177)>>2)]=$175;
   var $178=$x7;
   var $179=$x1;
   var $180=((($178)-($179))|0);
   var $181=$180 >> 8;
   var $182=$1;
   var $183=(($182+28)|0);
   HEAP32[(($183)>>2)]=$181;
   label = 4; break;
  case 4: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njSkipBits($bits) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   $1=$bits;
   var $2=HEAP32[((((524804)|0))>>2)];
   var $3=$1;
   var $4=(($2)|(0)) < (($3)|(0));
   if ($4) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $6=$1;
   var $7=_njShowBits($6);
   label = 3; break;
  case 3: 
   var $9=$1;
   var $10=HEAP32[((((524804)|0))>>2)];
   var $11=((($10)-($9))|0);
   HEAP32[((((524804)|0))>>2)]=$11;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _njGetVLC($vlc, $code) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $value;
   var $bits;
   $2=$vlc;
   $3=$code;
   var $4=_njShowBits(16);
   $value=$4;
   var $5=$value;
   var $6=$2;
   var $7=(($6+($5<<1))|0);
   var $8=(($7)|0);
   var $9=HEAP8[($8)];
   var $10=(($9)&(255));
   $bits=$10;
   var $11=$bits;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 2; break; }
  case 2: 
   HEAP32[((((72)|0))>>2)]=5;
   $1=0;
   label = 10; break;
  case 3: 
   var $15=$bits;
   _njSkipBits($15);
   var $16=$value;
   var $17=$2;
   var $18=(($17+($16<<1))|0);
   var $19=(($18+1)|0);
   var $20=HEAP8[($19)];
   var $21=(($20)&(255));
   $value=$21;
   var $22=$3;
   var $23=(($22)|(0))!=0;
   if ($23) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $25=$value;
   var $26=(($25) & 255);
   var $27=$3;
   HEAP8[($27)]=$26;
   label = 5; break;
  case 5: 
   var $29=$value;
   var $30=$29 & 15;
   $bits=$30;
   var $31=$bits;
   var $32=(($31)|(0))!=0;
   if ($32) { label = 7; break; } else { label = 6; break; }
  case 6: 
   $1=0;
   label = 10; break;
  case 7: 
   var $35=$bits;
   var $36=_njGetBits($35);
   $value=$36;
   var $37=$value;
   var $38=$bits;
   var $39=((($38)-(1))|0);
   var $40=1 << $39;
   var $41=(($37)|(0)) < (($40)|(0));
   if ($41) { label = 8; break; } else { label = 9; break; }
  case 8: 
   var $43=$bits;
   var $44=-1 << $43;
   var $45=((($44)+(1))|0);
   var $46=$value;
   var $47=((($46)+($45))|0);
   $value=$47;
   label = 9; break;
  case 9: 
   var $49=$value;
   $1=$49;
   label = 10; break;
  case 10: 
   var $51=$1;
   return $51;
  default: assert(0, "bad label: " + label);
 }
}
function _njColIDCT($blk, $out, $stride) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $x0;
   var $x1;
   var $x2;
   var $x3;
   var $x4;
   var $x5;
   var $x6;
   var $x7;
   var $x8;
   $1=$blk;
   $2=$out;
   $3=$stride;
   var $4=$1;
   var $5=(($4+128)|0);
   var $6=HEAP32[(($5)>>2)];
   var $7=$6 << 8;
   $x1=$7;
   var $8=$1;
   var $9=(($8+192)|0);
   var $10=HEAP32[(($9)>>2)];
   $x2=$10;
   var $11=$7 | $10;
   var $12=$1;
   var $13=(($12+64)|0);
   var $14=HEAP32[(($13)>>2)];
   $x3=$14;
   var $15=$11 | $14;
   var $16=$1;
   var $17=(($16+32)|0);
   var $18=HEAP32[(($17)>>2)];
   $x4=$18;
   var $19=$15 | $18;
   var $20=$1;
   var $21=(($20+224)|0);
   var $22=HEAP32[(($21)>>2)];
   $x5=$22;
   var $23=$19 | $22;
   var $24=$1;
   var $25=(($24+160)|0);
   var $26=HEAP32[(($25)>>2)];
   $x6=$26;
   var $27=$23 | $26;
   var $28=$1;
   var $29=(($28+96)|0);
   var $30=HEAP32[(($29)>>2)];
   $x7=$30;
   var $31=$27 | $30;
   var $32=(($31)|(0))!=0;
   if ($32) { label = 7; break; } else { label = 2; break; }
  case 2: 
   var $34=$1;
   var $35=(($34)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=((($36)+(32))|0);
   var $38=$37 >> 6;
   var $39=((($38)+(128))|0);
   var $40=_njClip($39);
   var $41=(($40)&(255));
   $x1=$41;
   $x0=8;
   label = 3; break;
  case 3: 
   var $43=$x0;
   var $44=(($43)|(0))!=0;
   if ($44) { label = 4; break; } else { label = 6; break; }
  case 4: 
   var $46=$x1;
   var $47=(($46) & 255);
   var $48=$2;
   HEAP8[($48)]=$47;
   var $49=$3;
   var $50=$2;
   var $51=(($50+$49)|0);
   $2=$51;
   label = 5; break;
  case 5: 
   var $53=$x0;
   var $54=((($53)-(1))|0);
   $x0=$54;
   label = 3; break;
  case 6: 
   label = 8; break;
  case 7: 
   var $57=$1;
   var $58=(($57)|0);
   var $59=HEAP32[(($58)>>2)];
   var $60=$59 << 8;
   var $61=((($60)+(8192))|0);
   $x0=$61;
   var $62=$x4;
   var $63=$x5;
   var $64=((($62)+($63))|0);
   var $65=((($64)*(565))&-1);
   var $66=((($65)+(4))|0);
   $x8=$66;
   var $67=$x8;
   var $68=$x4;
   var $69=((($68)*(2276))&-1);
   var $70=((($67)+($69))|0);
   var $71=$70 >> 3;
   $x4=$71;
   var $72=$x8;
   var $73=$x5;
   var $74=((($73)*(3406))&-1);
   var $75=((($72)-($74))|0);
   var $76=$75 >> 3;
   $x5=$76;
   var $77=$x6;
   var $78=$x7;
   var $79=((($77)+($78))|0);
   var $80=((($79)*(2408))&-1);
   var $81=((($80)+(4))|0);
   $x8=$81;
   var $82=$x8;
   var $83=$x6;
   var $84=((($83)*(799))&-1);
   var $85=((($82)-($84))|0);
   var $86=$85 >> 3;
   $x6=$86;
   var $87=$x8;
   var $88=$x7;
   var $89=((($88)*(4017))&-1);
   var $90=((($87)-($89))|0);
   var $91=$90 >> 3;
   $x7=$91;
   var $92=$x0;
   var $93=$x1;
   var $94=((($92)+($93))|0);
   $x8=$94;
   var $95=$x1;
   var $96=$x0;
   var $97=((($96)-($95))|0);
   $x0=$97;
   var $98=$x3;
   var $99=$x2;
   var $100=((($98)+($99))|0);
   var $101=((($100)*(1108))&-1);
   var $102=((($101)+(4))|0);
   $x1=$102;
   var $103=$x1;
   var $104=$x2;
   var $105=((($104)*(3784))&-1);
   var $106=((($103)-($105))|0);
   var $107=$106 >> 3;
   $x2=$107;
   var $108=$x1;
   var $109=$x3;
   var $110=((($109)*(1568))&-1);
   var $111=((($108)+($110))|0);
   var $112=$111 >> 3;
   $x3=$112;
   var $113=$x4;
   var $114=$x6;
   var $115=((($113)+($114))|0);
   $x1=$115;
   var $116=$x6;
   var $117=$x4;
   var $118=((($117)-($116))|0);
   $x4=$118;
   var $119=$x5;
   var $120=$x7;
   var $121=((($119)+($120))|0);
   $x6=$121;
   var $122=$x7;
   var $123=$x5;
   var $124=((($123)-($122))|0);
   $x5=$124;
   var $125=$x8;
   var $126=$x3;
   var $127=((($125)+($126))|0);
   $x7=$127;
   var $128=$x3;
   var $129=$x8;
   var $130=((($129)-($128))|0);
   $x8=$130;
   var $131=$x0;
   var $132=$x2;
   var $133=((($131)+($132))|0);
   $x3=$133;
   var $134=$x2;
   var $135=$x0;
   var $136=((($135)-($134))|0);
   $x0=$136;
   var $137=$x4;
   var $138=$x5;
   var $139=((($137)+($138))|0);
   var $140=((($139)*(181))&-1);
   var $141=((($140)+(128))|0);
   var $142=$141 >> 8;
   $x2=$142;
   var $143=$x4;
   var $144=$x5;
   var $145=((($143)-($144))|0);
   var $146=((($145)*(181))&-1);
   var $147=((($146)+(128))|0);
   var $148=$147 >> 8;
   $x4=$148;
   var $149=$x7;
   var $150=$x1;
   var $151=((($149)+($150))|0);
   var $152=$151 >> 14;
   var $153=((($152)+(128))|0);
   var $154=_njClip($153);
   var $155=$2;
   HEAP8[($155)]=$154;
   var $156=$3;
   var $157=$2;
   var $158=(($157+$156)|0);
   $2=$158;
   var $159=$x3;
   var $160=$x2;
   var $161=((($159)+($160))|0);
   var $162=$161 >> 14;
   var $163=((($162)+(128))|0);
   var $164=_njClip($163);
   var $165=$2;
   HEAP8[($165)]=$164;
   var $166=$3;
   var $167=$2;
   var $168=(($167+$166)|0);
   $2=$168;
   var $169=$x0;
   var $170=$x4;
   var $171=((($169)+($170))|0);
   var $172=$171 >> 14;
   var $173=((($172)+(128))|0);
   var $174=_njClip($173);
   var $175=$2;
   HEAP8[($175)]=$174;
   var $176=$3;
   var $177=$2;
   var $178=(($177+$176)|0);
   $2=$178;
   var $179=$x8;
   var $180=$x6;
   var $181=((($179)+($180))|0);
   var $182=$181 >> 14;
   var $183=((($182)+(128))|0);
   var $184=_njClip($183);
   var $185=$2;
   HEAP8[($185)]=$184;
   var $186=$3;
   var $187=$2;
   var $188=(($187+$186)|0);
   $2=$188;
   var $189=$x8;
   var $190=$x6;
   var $191=((($189)-($190))|0);
   var $192=$191 >> 14;
   var $193=((($192)+(128))|0);
   var $194=_njClip($193);
   var $195=$2;
   HEAP8[($195)]=$194;
   var $196=$3;
   var $197=$2;
   var $198=(($197+$196)|0);
   $2=$198;
   var $199=$x0;
   var $200=$x4;
   var $201=((($199)-($200))|0);
   var $202=$201 >> 14;
   var $203=((($202)+(128))|0);
   var $204=_njClip($203);
   var $205=$2;
   HEAP8[($205)]=$204;
   var $206=$3;
   var $207=$2;
   var $208=(($207+$206)|0);
   $2=$208;
   var $209=$x3;
   var $210=$x2;
   var $211=((($209)-($210))|0);
   var $212=$211 >> 14;
   var $213=((($212)+(128))|0);
   var $214=_njClip($213);
   var $215=$2;
   HEAP8[($215)]=$214;
   var $216=$3;
   var $217=$2;
   var $218=(($217+$216)|0);
   $2=$218;
   var $219=$x7;
   var $220=$x1;
   var $221=((($219)-($220))|0);
   var $222=$221 >> 14;
   var $223=((($222)+(128))|0);
   var $224=_njClip($223);
   var $225=$2;
   HEAP8[($225)]=$224;
   label = 8; break;
  case 8: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($bytes)>>>(0)) < 245;
   if ($1) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $3=(($bytes)>>>(0)) < 11;
   if ($3) { var $8 = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $5=((($bytes)+(11))|0);
   var $6=$5 & -8;
   var $8 = $6;label = 4; break;
  case 4: 
   var $8;
   var $9=$8 >>> 3;
   var $10=HEAP32[((((525112)|0))>>2)];
   var $11=$10 >>> (($9)>>>(0));
   var $12=$11 & 3;
   var $13=(($12)|(0))==0;
   if ($13) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $15=$11 & 1;
   var $16=$15 ^ 1;
   var $17=((($16)+($9))|0);
   var $18=$17 << 1;
   var $19=((525152+($18<<2))|0);
   var $20=$19;
   var $_sum111=((($18)+(2))|0);
   var $21=((525152+($_sum111<<2))|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22+8)|0);
   var $24=HEAP32[(($23)>>2)];
   var $25=(($20)|(0))==(($24)|(0));
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=1 << $17;
   var $28=$27 ^ -1;
   var $29=$10 & $28;
   HEAP32[((((525112)|0))>>2)]=$29;
   label = 11; break;
  case 7: 
   var $31=$24;
   var $32=HEAP32[((((525128)|0))>>2)];
   var $33=(($31)>>>(0)) < (($32)>>>(0));
   if ($33) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $35=(($24+12)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=(($36)|(0))==(($22)|(0));
   if ($37) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($35)>>2)]=$20;
   HEAP32[(($21)>>2)]=$24;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $40=$17 << 3;
   var $41=$40 | 3;
   var $42=(($22+4)|0);
   HEAP32[(($42)>>2)]=$41;
   var $43=$22;
   var $_sum113114=$40 | 4;
   var $44=(($43+$_sum113114)|0);
   var $45=$44;
   var $46=HEAP32[(($45)>>2)];
   var $47=$46 | 1;
   HEAP32[(($45)>>2)]=$47;
   var $48=$23;
   var $mem_0 = $48;label = 341; break;
  case 12: 
   var $50=HEAP32[((((525120)|0))>>2)];
   var $51=(($8)>>>(0)) > (($50)>>>(0));
   if ($51) { label = 13; break; } else { var $nb_0 = $8;label = 160; break; }
  case 13: 
   var $53=(($11)|(0))==0;
   if ($53) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $55=$11 << $9;
   var $56=2 << $9;
   var $57=(((-$56))|0);
   var $58=$56 | $57;
   var $59=$55 & $58;
   var $60=(((-$59))|0);
   var $61=$59 & $60;
   var $62=((($61)-(1))|0);
   var $63=$62 >>> 12;
   var $64=$63 & 16;
   var $65=$62 >>> (($64)>>>(0));
   var $66=$65 >>> 5;
   var $67=$66 & 8;
   var $68=$67 | $64;
   var $69=$65 >>> (($67)>>>(0));
   var $70=$69 >>> 2;
   var $71=$70 & 4;
   var $72=$68 | $71;
   var $73=$69 >>> (($71)>>>(0));
   var $74=$73 >>> 1;
   var $75=$74 & 2;
   var $76=$72 | $75;
   var $77=$73 >>> (($75)>>>(0));
   var $78=$77 >>> 1;
   var $79=$78 & 1;
   var $80=$76 | $79;
   var $81=$77 >>> (($79)>>>(0));
   var $82=((($80)+($81))|0);
   var $83=$82 << 1;
   var $84=((525152+($83<<2))|0);
   var $85=$84;
   var $_sum104=((($83)+(2))|0);
   var $86=((525152+($_sum104<<2))|0);
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($85)|(0))==(($89)|(0));
   if ($90) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $92=1 << $82;
   var $93=$92 ^ -1;
   var $94=$10 & $93;
   HEAP32[((((525112)|0))>>2)]=$94;
   label = 20; break;
  case 16: 
   var $96=$89;
   var $97=HEAP32[((((525128)|0))>>2)];
   var $98=(($96)>>>(0)) < (($97)>>>(0));
   if ($98) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $100=(($89+12)|0);
   var $101=HEAP32[(($100)>>2)];
   var $102=(($101)|(0))==(($87)|(0));
   if ($102) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($100)>>2)]=$85;
   HEAP32[(($86)>>2)]=$89;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $105=$82 << 3;
   var $106=((($105)-($8))|0);
   var $107=$8 | 3;
   var $108=(($87+4)|0);
   HEAP32[(($108)>>2)]=$107;
   var $109=$87;
   var $110=(($109+$8)|0);
   var $111=$110;
   var $112=$106 | 1;
   var $_sum106107=$8 | 4;
   var $113=(($109+$_sum106107)|0);
   var $114=$113;
   HEAP32[(($114)>>2)]=$112;
   var $115=(($109+$105)|0);
   var $116=$115;
   HEAP32[(($116)>>2)]=$106;
   var $117=HEAP32[((((525120)|0))>>2)];
   var $118=(($117)|(0))==0;
   if ($118) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $120=HEAP32[((((525132)|0))>>2)];
   var $121=$117 >>> 3;
   var $122=$121 << 1;
   var $123=((525152+($122<<2))|0);
   var $124=$123;
   var $125=HEAP32[((((525112)|0))>>2)];
   var $126=1 << $121;
   var $127=$125 & $126;
   var $128=(($127)|(0))==0;
   if ($128) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $130=$125 | $126;
   HEAP32[((((525112)|0))>>2)]=$130;
   var $_sum109_pre=((($122)+(2))|0);
   var $_pre=((525152+($_sum109_pre<<2))|0);
   var $F4_0 = $124;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $_sum110=((($122)+(2))|0);
   var $132=((525152+($_sum110<<2))|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$133;
   var $135=HEAP32[((((525128)|0))>>2)];
   var $136=(($134)>>>(0)) < (($135)>>>(0));
   if ($136) { label = 24; break; } else { var $F4_0 = $133;var $_pre_phi = $132;label = 25; break; }
  case 24: 
   _abort();
   throw "Reached an unreachable!";
  case 25: 
   var $_pre_phi;
   var $F4_0;
   HEAP32[(($_pre_phi)>>2)]=$120;
   var $139=(($F4_0+12)|0);
   HEAP32[(($139)>>2)]=$120;
   var $140=(($120+8)|0);
   HEAP32[(($140)>>2)]=$F4_0;
   var $141=(($120+12)|0);
   HEAP32[(($141)>>2)]=$124;
   label = 26; break;
  case 26: 
   HEAP32[((((525120)|0))>>2)]=$106;
   HEAP32[((((525132)|0))>>2)]=$111;
   var $143=$88;
   var $mem_0 = $143;label = 341; break;
  case 27: 
   var $145=HEAP32[((((525116)|0))>>2)];
   var $146=(($145)|(0))==0;
   if ($146) { var $nb_0 = $8;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $148=(((-$145))|0);
   var $149=$145 & $148;
   var $150=((($149)-(1))|0);
   var $151=$150 >>> 12;
   var $152=$151 & 16;
   var $153=$150 >>> (($152)>>>(0));
   var $154=$153 >>> 5;
   var $155=$154 & 8;
   var $156=$155 | $152;
   var $157=$153 >>> (($155)>>>(0));
   var $158=$157 >>> 2;
   var $159=$158 & 4;
   var $160=$156 | $159;
   var $161=$157 >>> (($159)>>>(0));
   var $162=$161 >>> 1;
   var $163=$162 & 2;
   var $164=$160 | $163;
   var $165=$161 >>> (($163)>>>(0));
   var $166=$165 >>> 1;
   var $167=$166 & 1;
   var $168=$164 | $167;
   var $169=$165 >>> (($167)>>>(0));
   var $170=((($168)+($169))|0);
   var $171=((525416+($170<<2))|0);
   var $172=HEAP32[(($171)>>2)];
   var $173=(($172+4)|0);
   var $174=HEAP32[(($173)>>2)];
   var $175=$174 & -8;
   var $176=((($175)-($8))|0);
   var $t_0_i = $172;var $v_0_i = $172;var $rsize_0_i = $176;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $178=(($t_0_i+16)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=(($179)|(0))==0;
   if ($180) { label = 30; break; } else { var $185 = $179;label = 31; break; }
  case 30: 
   var $182=(($t_0_i+20)|0);
   var $183=HEAP32[(($182)>>2)];
   var $184=(($183)|(0))==0;
   if ($184) { label = 32; break; } else { var $185 = $183;label = 31; break; }
  case 31: 
   var $185;
   var $186=(($185+4)|0);
   var $187=HEAP32[(($186)>>2)];
   var $188=$187 & -8;
   var $189=((($188)-($8))|0);
   var $190=(($189)>>>(0)) < (($rsize_0_i)>>>(0));
   var $_rsize_0_i=$190 ? $189 : $rsize_0_i;
   var $_v_0_i=$190 ? $185 : $v_0_i;
   var $t_0_i = $185;var $v_0_i = $_v_0_i;var $rsize_0_i = $_rsize_0_i;label = 29; break;
  case 32: 
   var $192=$v_0_i;
   var $193=HEAP32[((((525128)|0))>>2)];
   var $194=(($192)>>>(0)) < (($193)>>>(0));
   if ($194) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $196=(($192+$8)|0);
   var $197=$196;
   var $198=(($192)>>>(0)) < (($196)>>>(0));
   if ($198) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $200=(($v_0_i+24)|0);
   var $201=HEAP32[(($200)>>2)];
   var $202=(($v_0_i+12)|0);
   var $203=HEAP32[(($202)>>2)];
   var $204=(($203)|(0))==(($v_0_i)|(0));
   if ($204) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $206=(($v_0_i+8)|0);
   var $207=HEAP32[(($206)>>2)];
   var $208=$207;
   var $209=(($208)>>>(0)) < (($193)>>>(0));
   if ($209) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $211=(($207+12)|0);
   var $212=HEAP32[(($211)>>2)];
   var $213=(($212)|(0))==(($v_0_i)|(0));
   if ($213) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $215=(($203+8)|0);
   var $216=HEAP32[(($215)>>2)];
   var $217=(($216)|(0))==(($v_0_i)|(0));
   if ($217) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($211)>>2)]=$203;
   HEAP32[(($215)>>2)]=$207;
   var $R_1_i = $203;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $220=(($v_0_i+20)|0);
   var $221=HEAP32[(($220)>>2)];
   var $222=(($221)|(0))==0;
   if ($222) { label = 41; break; } else { var $R_0_i = $221;var $RP_0_i = $220;label = 42; break; }
  case 41: 
   var $224=(($v_0_i+16)|0);
   var $225=HEAP32[(($224)>>2)];
   var $226=(($225)|(0))==0;
   if ($226) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $225;var $RP_0_i = $224;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $227=(($R_0_i+20)|0);
   var $228=HEAP32[(($227)>>2)];
   var $229=(($228)|(0))==0;
   if ($229) { label = 43; break; } else { var $R_0_i = $228;var $RP_0_i = $227;label = 42; break; }
  case 43: 
   var $231=(($R_0_i+16)|0);
   var $232=HEAP32[(($231)>>2)];
   var $233=(($232)|(0))==0;
   if ($233) { label = 44; break; } else { var $R_0_i = $232;var $RP_0_i = $231;label = 42; break; }
  case 44: 
   var $235=$RP_0_i;
   var $236=(($235)>>>(0)) < (($193)>>>(0));
   if ($236) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $240=(($201)|(0))==0;
   if ($240) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $242=(($v_0_i+28)|0);
   var $243=HEAP32[(($242)>>2)];
   var $244=((525416+($243<<2))|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=(($v_0_i)|(0))==(($245)|(0));
   if ($246) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($244)>>2)]=$R_1_i;
   var $cond_i=(($R_1_i)|(0))==0;
   if ($cond_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $248=HEAP32[(($242)>>2)];
   var $249=1 << $248;
   var $250=$249 ^ -1;
   var $251=HEAP32[((((525116)|0))>>2)];
   var $252=$251 & $250;
   HEAP32[((((525116)|0))>>2)]=$252;
   label = 67; break;
  case 51: 
   var $254=$201;
   var $255=HEAP32[((((525128)|0))>>2)];
   var $256=(($254)>>>(0)) < (($255)>>>(0));
   if ($256) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $258=(($201+16)|0);
   var $259=HEAP32[(($258)>>2)];
   var $260=(($259)|(0))==(($v_0_i)|(0));
   if ($260) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($258)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $263=(($201+20)|0);
   HEAP32[(($263)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $266=(($R_1_i)|(0))==0;
   if ($266) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $268=$R_1_i;
   var $269=HEAP32[((((525128)|0))>>2)];
   var $270=(($268)>>>(0)) < (($269)>>>(0));
   if ($270) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $272=(($R_1_i+24)|0);
   HEAP32[(($272)>>2)]=$201;
   var $273=(($v_0_i+16)|0);
   var $274=HEAP32[(($273)>>2)];
   var $275=(($274)|(0))==0;
   if ($275) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $277=$274;
   var $278=HEAP32[((((525128)|0))>>2)];
   var $279=(($277)>>>(0)) < (($278)>>>(0));
   if ($279) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $281=(($R_1_i+16)|0);
   HEAP32[(($281)>>2)]=$274;
   var $282=(($274+24)|0);
   HEAP32[(($282)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $285=(($v_0_i+20)|0);
   var $286=HEAP32[(($285)>>2)];
   var $287=(($286)|(0))==0;
   if ($287) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $289=$286;
   var $290=HEAP32[((((525128)|0))>>2)];
   var $291=(($289)>>>(0)) < (($290)>>>(0));
   if ($291) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $293=(($R_1_i+20)|0);
   HEAP32[(($293)>>2)]=$286;
   var $294=(($286+24)|0);
   HEAP32[(($294)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $298=(($rsize_0_i)>>>(0)) < 16;
   if ($298) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $300=((($rsize_0_i)+($8))|0);
   var $301=$300 | 3;
   var $302=(($v_0_i+4)|0);
   HEAP32[(($302)>>2)]=$301;
   var $_sum4_i=((($300)+(4))|0);
   var $303=(($192+$_sum4_i)|0);
   var $304=$303;
   var $305=HEAP32[(($304)>>2)];
   var $306=$305 | 1;
   HEAP32[(($304)>>2)]=$306;
   label = 77; break;
  case 69: 
   var $308=$8 | 3;
   var $309=(($v_0_i+4)|0);
   HEAP32[(($309)>>2)]=$308;
   var $310=$rsize_0_i | 1;
   var $_sum_i137=$8 | 4;
   var $311=(($192+$_sum_i137)|0);
   var $312=$311;
   HEAP32[(($312)>>2)]=$310;
   var $_sum1_i=((($rsize_0_i)+($8))|0);
   var $313=(($192+$_sum1_i)|0);
   var $314=$313;
   HEAP32[(($314)>>2)]=$rsize_0_i;
   var $315=HEAP32[((((525120)|0))>>2)];
   var $316=(($315)|(0))==0;
   if ($316) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $318=HEAP32[((((525132)|0))>>2)];
   var $319=$315 >>> 3;
   var $320=$319 << 1;
   var $321=((525152+($320<<2))|0);
   var $322=$321;
   var $323=HEAP32[((((525112)|0))>>2)];
   var $324=1 << $319;
   var $325=$323 & $324;
   var $326=(($325)|(0))==0;
   if ($326) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $328=$323 | $324;
   HEAP32[((((525112)|0))>>2)]=$328;
   var $_sum2_pre_i=((($320)+(2))|0);
   var $_pre_i=((525152+($_sum2_pre_i<<2))|0);
   var $F1_0_i = $322;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $_sum3_i=((($320)+(2))|0);
   var $330=((525152+($_sum3_i<<2))|0);
   var $331=HEAP32[(($330)>>2)];
   var $332=$331;
   var $333=HEAP32[((((525128)|0))>>2)];
   var $334=(($332)>>>(0)) < (($333)>>>(0));
   if ($334) { label = 73; break; } else { var $F1_0_i = $331;var $_pre_phi_i = $330;label = 74; break; }
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $_pre_phi_i;
   var $F1_0_i;
   HEAP32[(($_pre_phi_i)>>2)]=$318;
   var $337=(($F1_0_i+12)|0);
   HEAP32[(($337)>>2)]=$318;
   var $338=(($318+8)|0);
   HEAP32[(($338)>>2)]=$F1_0_i;
   var $339=(($318+12)|0);
   HEAP32[(($339)>>2)]=$322;
   label = 75; break;
  case 75: 
   HEAP32[((((525120)|0))>>2)]=$rsize_0_i;
   HEAP32[((((525132)|0))>>2)]=$197;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $342=(($v_0_i+8)|0);
   var $343=$342;
   var $344=(($342)|(0))==0;
   if ($344) { var $nb_0 = $8;label = 160; break; } else { var $mem_0 = $343;label = 341; break; }
  case 78: 
   var $346=(($bytes)>>>(0)) > 4294967231;
   if ($346) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $348=((($bytes)+(11))|0);
   var $349=$348 & -8;
   var $350=HEAP32[((((525116)|0))>>2)];
   var $351=(($350)|(0))==0;
   if ($351) { var $nb_0 = $349;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $353=(((-$349))|0);
   var $354=$348 >>> 8;
   var $355=(($354)|(0))==0;
   if ($355) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $357=(($349)>>>(0)) > 16777215;
   if ($357) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $359=((($354)+(1048320))|0);
   var $360=$359 >>> 16;
   var $361=$360 & 8;
   var $362=$354 << $361;
   var $363=((($362)+(520192))|0);
   var $364=$363 >>> 16;
   var $365=$364 & 4;
   var $366=$365 | $361;
   var $367=$362 << $365;
   var $368=((($367)+(245760))|0);
   var $369=$368 >>> 16;
   var $370=$369 & 2;
   var $371=$366 | $370;
   var $372=(((14)-($371))|0);
   var $373=$367 << $370;
   var $374=$373 >>> 15;
   var $375=((($372)+($374))|0);
   var $376=$375 << 1;
   var $377=((($375)+(7))|0);
   var $378=$349 >>> (($377)>>>(0));
   var $379=$378 & 1;
   var $380=$379 | $376;
   var $idx_0_i = $380;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $382=((525416+($idx_0_i<<2))|0);
   var $383=HEAP32[(($382)>>2)];
   var $384=(($383)|(0))==0;
   if ($384) { var $v_2_i = 0;var $rsize_2_i = $353;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $386=(($idx_0_i)|(0))==31;
   if ($386) { var $391 = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $388=$idx_0_i >>> 1;
   var $389=(((25)-($388))|0);
   var $391 = $389;label = 86; break;
  case 86: 
   var $391;
   var $392=$349 << $391;
   var $v_0_i118 = 0;var $rsize_0_i117 = $353;var $t_0_i116 = $383;var $sizebits_0_i = $392;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i116;
   var $rsize_0_i117;
   var $v_0_i118;
   var $394=(($t_0_i116+4)|0);
   var $395=HEAP32[(($394)>>2)];
   var $396=$395 & -8;
   var $397=((($396)-($349))|0);
   var $398=(($397)>>>(0)) < (($rsize_0_i117)>>>(0));
   if ($398) { label = 88; break; } else { var $v_1_i = $v_0_i118;var $rsize_1_i = $rsize_0_i117;label = 89; break; }
  case 88: 
   var $400=(($396)|(0))==(($349)|(0));
   if ($400) { var $v_2_i = $t_0_i116;var $rsize_2_i = $397;var $t_1_i = $t_0_i116;label = 90; break; } else { var $v_1_i = $t_0_i116;var $rsize_1_i = $397;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $402=(($t_0_i116+20)|0);
   var $403=HEAP32[(($402)>>2)];
   var $404=$sizebits_0_i >>> 31;
   var $405=(($t_0_i116+16+($404<<2))|0);
   var $406=HEAP32[(($405)>>2)];
   var $407=(($403)|(0))==0;
   var $408=(($403)|(0))==(($406)|(0));
   var $or_cond_i=$407 | $408;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $403;
   var $409=(($406)|(0))==0;
   var $410=$sizebits_0_i << 1;
   if ($409) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i118 = $v_1_i;var $rsize_0_i117 = $rsize_1_i;var $t_0_i116 = $406;var $sizebits_0_i = $410;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $411=(($t_1_i)|(0))==0;
   var $412=(($v_2_i)|(0))==0;
   var $or_cond21_i=$411 & $412;
   if ($or_cond21_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $414=2 << $idx_0_i;
   var $415=(((-$414))|0);
   var $416=$414 | $415;
   var $417=$350 & $416;
   var $418=(($417)|(0))==0;
   if ($418) { var $nb_0 = $349;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $420=(((-$417))|0);
   var $421=$417 & $420;
   var $422=((($421)-(1))|0);
   var $423=$422 >>> 12;
   var $424=$423 & 16;
   var $425=$422 >>> (($424)>>>(0));
   var $426=$425 >>> 5;
   var $427=$426 & 8;
   var $428=$427 | $424;
   var $429=$425 >>> (($427)>>>(0));
   var $430=$429 >>> 2;
   var $431=$430 & 4;
   var $432=$428 | $431;
   var $433=$429 >>> (($431)>>>(0));
   var $434=$433 >>> 1;
   var $435=$434 & 2;
   var $436=$432 | $435;
   var $437=$433 >>> (($435)>>>(0));
   var $438=$437 >>> 1;
   var $439=$438 & 1;
   var $440=$436 | $439;
   var $441=$437 >>> (($439)>>>(0));
   var $442=((($440)+($441))|0);
   var $443=((525416+($442<<2))|0);
   var $444=HEAP32[(($443)>>2)];
   var $t_2_ph_i = $444;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $445=(($t_2_ph_i)|(0))==0;
   if ($445) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_228_i = $t_2_ph_i;var $rsize_329_i = $rsize_2_i;var $v_330_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_330_i;
   var $rsize_329_i;
   var $t_228_i;
   var $446=(($t_228_i+4)|0);
   var $447=HEAP32[(($446)>>2)];
   var $448=$447 & -8;
   var $449=((($448)-($349))|0);
   var $450=(($449)>>>(0)) < (($rsize_329_i)>>>(0));
   var $_rsize_3_i=$450 ? $449 : $rsize_329_i;
   var $t_2_v_3_i=$450 ? $t_228_i : $v_330_i;
   var $451=(($t_228_i+16)|0);
   var $452=HEAP32[(($451)>>2)];
   var $453=(($452)|(0))==0;
   if ($453) { label = 95; break; } else { var $t_228_i = $452;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $454=(($t_228_i+20)|0);
   var $455=HEAP32[(($454)>>2)];
   var $456=(($455)|(0))==0;
   if ($456) { var $rsize_3_lcssa_i = $_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_228_i = $455;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $457=(($v_3_lcssa_i)|(0))==0;
   if ($457) { var $nb_0 = $349;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $459=HEAP32[((((525120)|0))>>2)];
   var $460=((($459)-($349))|0);
   var $461=(($rsize_3_lcssa_i)>>>(0)) < (($460)>>>(0));
   if ($461) { label = 98; break; } else { var $nb_0 = $349;label = 160; break; }
  case 98: 
   var $463=$v_3_lcssa_i;
   var $464=HEAP32[((((525128)|0))>>2)];
   var $465=(($463)>>>(0)) < (($464)>>>(0));
   if ($465) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $467=(($463+$349)|0);
   var $468=$467;
   var $469=(($463)>>>(0)) < (($467)>>>(0));
   if ($469) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $471=(($v_3_lcssa_i+24)|0);
   var $472=HEAP32[(($471)>>2)];
   var $473=(($v_3_lcssa_i+12)|0);
   var $474=HEAP32[(($473)>>2)];
   var $475=(($474)|(0))==(($v_3_lcssa_i)|(0));
   if ($475) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $477=(($v_3_lcssa_i+8)|0);
   var $478=HEAP32[(($477)>>2)];
   var $479=$478;
   var $480=(($479)>>>(0)) < (($464)>>>(0));
   if ($480) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $482=(($478+12)|0);
   var $483=HEAP32[(($482)>>2)];
   var $484=(($483)|(0))==(($v_3_lcssa_i)|(0));
   if ($484) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $486=(($474+8)|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=(($487)|(0))==(($v_3_lcssa_i)|(0));
   if ($488) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($482)>>2)]=$474;
   HEAP32[(($486)>>2)]=$478;
   var $R_1_i122 = $474;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $491=(($v_3_lcssa_i+20)|0);
   var $492=HEAP32[(($491)>>2)];
   var $493=(($492)|(0))==0;
   if ($493) { label = 107; break; } else { var $R_0_i120 = $492;var $RP_0_i119 = $491;label = 108; break; }
  case 107: 
   var $495=(($v_3_lcssa_i+16)|0);
   var $496=HEAP32[(($495)>>2)];
   var $497=(($496)|(0))==0;
   if ($497) { var $R_1_i122 = 0;label = 113; break; } else { var $R_0_i120 = $496;var $RP_0_i119 = $495;label = 108; break; }
  case 108: 
   var $RP_0_i119;
   var $R_0_i120;
   var $498=(($R_0_i120+20)|0);
   var $499=HEAP32[(($498)>>2)];
   var $500=(($499)|(0))==0;
   if ($500) { label = 109; break; } else { var $R_0_i120 = $499;var $RP_0_i119 = $498;label = 108; break; }
  case 109: 
   var $502=(($R_0_i120+16)|0);
   var $503=HEAP32[(($502)>>2)];
   var $504=(($503)|(0))==0;
   if ($504) { label = 110; break; } else { var $R_0_i120 = $503;var $RP_0_i119 = $502;label = 108; break; }
  case 110: 
   var $506=$RP_0_i119;
   var $507=(($506)>>>(0)) < (($464)>>>(0));
   if ($507) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i119)>>2)]=0;
   var $R_1_i122 = $R_0_i120;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i122;
   var $511=(($472)|(0))==0;
   if ($511) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $513=(($v_3_lcssa_i+28)|0);
   var $514=HEAP32[(($513)>>2)];
   var $515=((525416+($514<<2))|0);
   var $516=HEAP32[(($515)>>2)];
   var $517=(($v_3_lcssa_i)|(0))==(($516)|(0));
   if ($517) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($515)>>2)]=$R_1_i122;
   var $cond_i123=(($R_1_i122)|(0))==0;
   if ($cond_i123) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $519=HEAP32[(($513)>>2)];
   var $520=1 << $519;
   var $521=$520 ^ -1;
   var $522=HEAP32[((((525116)|0))>>2)];
   var $523=$522 & $521;
   HEAP32[((((525116)|0))>>2)]=$523;
   label = 133; break;
  case 117: 
   var $525=$472;
   var $526=HEAP32[((((525128)|0))>>2)];
   var $527=(($525)>>>(0)) < (($526)>>>(0));
   if ($527) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $529=(($472+16)|0);
   var $530=HEAP32[(($529)>>2)];
   var $531=(($530)|(0))==(($v_3_lcssa_i)|(0));
   if ($531) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($529)>>2)]=$R_1_i122;
   label = 122; break;
  case 120: 
   var $534=(($472+20)|0);
   HEAP32[(($534)>>2)]=$R_1_i122;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $537=(($R_1_i122)|(0))==0;
   if ($537) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $539=$R_1_i122;
   var $540=HEAP32[((((525128)|0))>>2)];
   var $541=(($539)>>>(0)) < (($540)>>>(0));
   if ($541) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $543=(($R_1_i122+24)|0);
   HEAP32[(($543)>>2)]=$472;
   var $544=(($v_3_lcssa_i+16)|0);
   var $545=HEAP32[(($544)>>2)];
   var $546=(($545)|(0))==0;
   if ($546) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $548=$545;
   var $549=HEAP32[((((525128)|0))>>2)];
   var $550=(($548)>>>(0)) < (($549)>>>(0));
   if ($550) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $552=(($R_1_i122+16)|0);
   HEAP32[(($552)>>2)]=$545;
   var $553=(($545+24)|0);
   HEAP32[(($553)>>2)]=$R_1_i122;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $556=(($v_3_lcssa_i+20)|0);
   var $557=HEAP32[(($556)>>2)];
   var $558=(($557)|(0))==0;
   if ($558) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $560=$557;
   var $561=HEAP32[((((525128)|0))>>2)];
   var $562=(($560)>>>(0)) < (($561)>>>(0));
   if ($562) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $564=(($R_1_i122+20)|0);
   HEAP32[(($564)>>2)]=$557;
   var $565=(($557+24)|0);
   HEAP32[(($565)>>2)]=$R_1_i122;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $569=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($569) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $571=((($rsize_3_lcssa_i)+($349))|0);
   var $572=$571 | 3;
   var $573=(($v_3_lcssa_i+4)|0);
   HEAP32[(($573)>>2)]=$572;
   var $_sum19_i=((($571)+(4))|0);
   var $574=(($463+$_sum19_i)|0);
   var $575=$574;
   var $576=HEAP32[(($575)>>2)];
   var $577=$576 | 1;
   HEAP32[(($575)>>2)]=$577;
   label = 159; break;
  case 135: 
   var $579=$349 | 3;
   var $580=(($v_3_lcssa_i+4)|0);
   HEAP32[(($580)>>2)]=$579;
   var $581=$rsize_3_lcssa_i | 1;
   var $_sum_i125136=$349 | 4;
   var $582=(($463+$_sum_i125136)|0);
   var $583=$582;
   HEAP32[(($583)>>2)]=$581;
   var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
   var $584=(($463+$_sum1_i126)|0);
   var $585=$584;
   HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
   var $586=$rsize_3_lcssa_i >>> 3;
   var $587=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($587) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $589=$586 << 1;
   var $590=((525152+($589<<2))|0);
   var $591=$590;
   var $592=HEAP32[((((525112)|0))>>2)];
   var $593=1 << $586;
   var $594=$592 & $593;
   var $595=(($594)|(0))==0;
   if ($595) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $597=$592 | $593;
   HEAP32[((((525112)|0))>>2)]=$597;
   var $_sum15_pre_i=((($589)+(2))|0);
   var $_pre_i127=((525152+($_sum15_pre_i<<2))|0);
   var $F5_0_i = $591;var $_pre_phi_i128 = $_pre_i127;label = 140; break;
  case 138: 
   var $_sum18_i=((($589)+(2))|0);
   var $599=((525152+($_sum18_i<<2))|0);
   var $600=HEAP32[(($599)>>2)];
   var $601=$600;
   var $602=HEAP32[((((525128)|0))>>2)];
   var $603=(($601)>>>(0)) < (($602)>>>(0));
   if ($603) { label = 139; break; } else { var $F5_0_i = $600;var $_pre_phi_i128 = $599;label = 140; break; }
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   var $_pre_phi_i128;
   var $F5_0_i;
   HEAP32[(($_pre_phi_i128)>>2)]=$468;
   var $606=(($F5_0_i+12)|0);
   HEAP32[(($606)>>2)]=$468;
   var $_sum16_i=((($349)+(8))|0);
   var $607=(($463+$_sum16_i)|0);
   var $608=$607;
   HEAP32[(($608)>>2)]=$F5_0_i;
   var $_sum17_i=((($349)+(12))|0);
   var $609=(($463+$_sum17_i)|0);
   var $610=$609;
   HEAP32[(($610)>>2)]=$591;
   label = 159; break;
  case 141: 
   var $612=$467;
   var $613=$rsize_3_lcssa_i >>> 8;
   var $614=(($613)|(0))==0;
   if ($614) { var $I7_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $616=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($616) { var $I7_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $618=((($613)+(1048320))|0);
   var $619=$618 >>> 16;
   var $620=$619 & 8;
   var $621=$613 << $620;
   var $622=((($621)+(520192))|0);
   var $623=$622 >>> 16;
   var $624=$623 & 4;
   var $625=$624 | $620;
   var $626=$621 << $624;
   var $627=((($626)+(245760))|0);
   var $628=$627 >>> 16;
   var $629=$628 & 2;
   var $630=$625 | $629;
   var $631=(((14)-($630))|0);
   var $632=$626 << $629;
   var $633=$632 >>> 15;
   var $634=((($631)+($633))|0);
   var $635=$634 << 1;
   var $636=((($634)+(7))|0);
   var $637=$rsize_3_lcssa_i >>> (($636)>>>(0));
   var $638=$637 & 1;
   var $639=$638 | $635;
   var $I7_0_i = $639;label = 144; break;
  case 144: 
   var $I7_0_i;
   var $641=((525416+($I7_0_i<<2))|0);
   var $_sum2_i=((($349)+(28))|0);
   var $642=(($463+$_sum2_i)|0);
   var $643=$642;
   HEAP32[(($643)>>2)]=$I7_0_i;
   var $_sum3_i129=((($349)+(16))|0);
   var $644=(($463+$_sum3_i129)|0);
   var $_sum4_i130=((($349)+(20))|0);
   var $645=(($463+$_sum4_i130)|0);
   var $646=$645;
   HEAP32[(($646)>>2)]=0;
   var $647=$644;
   HEAP32[(($647)>>2)]=0;
   var $648=HEAP32[((((525116)|0))>>2)];
   var $649=1 << $I7_0_i;
   var $650=$648 & $649;
   var $651=(($650)|(0))==0;
   if ($651) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $653=$648 | $649;
   HEAP32[((((525116)|0))>>2)]=$653;
   HEAP32[(($641)>>2)]=$612;
   var $654=$641;
   var $_sum5_i=((($349)+(24))|0);
   var $655=(($463+$_sum5_i)|0);
   var $656=$655;
   HEAP32[(($656)>>2)]=$654;
   var $_sum6_i=((($349)+(12))|0);
   var $657=(($463+$_sum6_i)|0);
   var $658=$657;
   HEAP32[(($658)>>2)]=$612;
   var $_sum7_i=((($349)+(8))|0);
   var $659=(($463+$_sum7_i)|0);
   var $660=$659;
   HEAP32[(($660)>>2)]=$612;
   label = 159; break;
  case 146: 
   var $662=HEAP32[(($641)>>2)];
   var $663=(($I7_0_i)|(0))==31;
   if ($663) { var $668 = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $665=$I7_0_i >>> 1;
   var $666=(((25)-($665))|0);
   var $668 = $666;label = 148; break;
  case 148: 
   var $668;
   var $669=$rsize_3_lcssa_i << $668;
   var $K12_0_i = $669;var $T_0_i = $662;label = 149; break;
  case 149: 
   var $T_0_i;
   var $K12_0_i;
   var $671=(($T_0_i+4)|0);
   var $672=HEAP32[(($671)>>2)];
   var $673=$672 & -8;
   var $674=(($673)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($674) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $676=$K12_0_i >>> 31;
   var $677=(($T_0_i+16+($676<<2))|0);
   var $678=HEAP32[(($677)>>2)];
   var $679=(($678)|(0))==0;
   var $680=$K12_0_i << 1;
   if ($679) { label = 151; break; } else { var $K12_0_i = $680;var $T_0_i = $678;label = 149; break; }
  case 151: 
   var $682=$677;
   var $683=HEAP32[((((525128)|0))>>2)];
   var $684=(($682)>>>(0)) < (($683)>>>(0));
   if ($684) { label = 153; break; } else { label = 152; break; }
  case 152: 
   HEAP32[(($677)>>2)]=$612;
   var $_sum12_i=((($349)+(24))|0);
   var $686=(($463+$_sum12_i)|0);
   var $687=$686;
   HEAP32[(($687)>>2)]=$T_0_i;
   var $_sum13_i=((($349)+(12))|0);
   var $688=(($463+$_sum13_i)|0);
   var $689=$688;
   HEAP32[(($689)>>2)]=$612;
   var $_sum14_i=((($349)+(8))|0);
   var $690=(($463+$_sum14_i)|0);
   var $691=$690;
   HEAP32[(($691)>>2)]=$612;
   label = 159; break;
  case 153: 
   _abort();
   throw "Reached an unreachable!";
  case 154: 
   var $694=(($T_0_i+8)|0);
   var $695=HEAP32[(($694)>>2)];
   var $696=$T_0_i;
   var $697=HEAP32[((((525128)|0))>>2)];
   var $698=(($696)>>>(0)) < (($697)>>>(0));
   if ($698) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $700=$695;
   var $701=(($700)>>>(0)) < (($697)>>>(0));
   if ($701) { label = 157; break; } else { label = 156; break; }
  case 156: 
   var $703=(($695+12)|0);
   HEAP32[(($703)>>2)]=$612;
   HEAP32[(($694)>>2)]=$612;
   var $_sum9_i=((($349)+(8))|0);
   var $704=(($463+$_sum9_i)|0);
   var $705=$704;
   HEAP32[(($705)>>2)]=$695;
   var $_sum10_i=((($349)+(12))|0);
   var $706=(($463+$_sum10_i)|0);
   var $707=$706;
   HEAP32[(($707)>>2)]=$T_0_i;
   var $_sum11_i=((($349)+(24))|0);
   var $708=(($463+$_sum11_i)|0);
   var $709=$708;
   HEAP32[(($709)>>2)]=0;
   label = 159; break;
  case 157: 
   _abort();
   throw "Reached an unreachable!";
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   var $711=(($v_3_lcssa_i+8)|0);
   var $712=$711;
   var $713=(($711)|(0))==0;
   if ($713) { var $nb_0 = $349;label = 160; break; } else { var $mem_0 = $712;label = 341; break; }
  case 160: 
   var $nb_0;
   var $714=HEAP32[((((525120)|0))>>2)];
   var $715=(($nb_0)>>>(0)) > (($714)>>>(0));
   if ($715) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $717=((($714)-($nb_0))|0);
   var $718=HEAP32[((((525132)|0))>>2)];
   var $719=(($717)>>>(0)) > 15;
   if ($719) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $721=$718;
   var $722=(($721+$nb_0)|0);
   var $723=$722;
   HEAP32[((((525132)|0))>>2)]=$723;
   HEAP32[((((525120)|0))>>2)]=$717;
   var $724=$717 | 1;
   var $_sum102=((($nb_0)+(4))|0);
   var $725=(($721+$_sum102)|0);
   var $726=$725;
   HEAP32[(($726)>>2)]=$724;
   var $727=(($721+$714)|0);
   var $728=$727;
   HEAP32[(($728)>>2)]=$717;
   var $729=$nb_0 | 3;
   var $730=(($718+4)|0);
   HEAP32[(($730)>>2)]=$729;
   label = 164; break;
  case 163: 
   HEAP32[((((525120)|0))>>2)]=0;
   HEAP32[((((525132)|0))>>2)]=0;
   var $732=$714 | 3;
   var $733=(($718+4)|0);
   HEAP32[(($733)>>2)]=$732;
   var $734=$718;
   var $_sum101=((($714)+(4))|0);
   var $735=(($734+$_sum101)|0);
   var $736=$735;
   var $737=HEAP32[(($736)>>2)];
   var $738=$737 | 1;
   HEAP32[(($736)>>2)]=$738;
   label = 164; break;
  case 164: 
   var $740=(($718+8)|0);
   var $741=$740;
   var $mem_0 = $741;label = 341; break;
  case 165: 
   var $743=HEAP32[((((525124)|0))>>2)];
   var $744=(($nb_0)>>>(0)) < (($743)>>>(0));
   if ($744) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $746=((($743)-($nb_0))|0);
   HEAP32[((((525124)|0))>>2)]=$746;
   var $747=HEAP32[((((525136)|0))>>2)];
   var $748=$747;
   var $749=(($748+$nb_0)|0);
   var $750=$749;
   HEAP32[((((525136)|0))>>2)]=$750;
   var $751=$746 | 1;
   var $_sum=((($nb_0)+(4))|0);
   var $752=(($748+$_sum)|0);
   var $753=$752;
   HEAP32[(($753)>>2)]=$751;
   var $754=$nb_0 | 3;
   var $755=(($747+4)|0);
   HEAP32[(($755)>>2)]=$754;
   var $756=(($747+8)|0);
   var $757=$756;
   var $mem_0 = $757;label = 341; break;
  case 167: 
   var $759=HEAP32[((((525072)|0))>>2)];
   var $760=(($759)|(0))==0;
   if ($760) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $762=_sysconf(8);
   var $763=((($762)-(1))|0);
   var $764=$763 & $762;
   var $765=(($764)|(0))==0;
   if ($765) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((525080)|0))>>2)]=$762;
   HEAP32[((((525076)|0))>>2)]=$762;
   HEAP32[((((525084)|0))>>2)]=-1;
   HEAP32[((((525088)|0))>>2)]=-1;
   HEAP32[((((525092)|0))>>2)]=0;
   HEAP32[((((525556)|0))>>2)]=0;
   var $767=_time(0);
   var $768=$767 & -16;
   var $769=$768 ^ 1431655768;
   HEAP32[((((525072)|0))>>2)]=$769;
   label = 171; break;
  case 171: 
   var $771=((($nb_0)+(48))|0);
   var $772=HEAP32[((((525080)|0))>>2)];
   var $773=((($nb_0)+(47))|0);
   var $774=((($772)+($773))|0);
   var $775=(((-$772))|0);
   var $776=$774 & $775;
   var $777=(($776)>>>(0)) > (($nb_0)>>>(0));
   if ($777) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $779=HEAP32[((((525552)|0))>>2)];
   var $780=(($779)|(0))==0;
   if ($780) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $782=HEAP32[((((525544)|0))>>2)];
   var $783=((($782)+($776))|0);
   var $784=(($783)>>>(0)) <= (($782)>>>(0));
   var $785=(($783)>>>(0)) > (($779)>>>(0));
   var $or_cond1_i=$784 | $785;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $787=HEAP32[((((525556)|0))>>2)];
   var $788=$787 & 4;
   var $789=(($788)|(0))==0;
   if ($789) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $791=HEAP32[((((525136)|0))>>2)];
   var $792=(($791)|(0))==0;
   if ($792) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $794=$791;
   var $sp_0_i_i = ((525560)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $796=(($sp_0_i_i)|0);
   var $797=HEAP32[(($796)>>2)];
   var $798=(($797)>>>(0)) > (($794)>>>(0));
   if ($798) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $800=(($sp_0_i_i+4)|0);
   var $801=HEAP32[(($800)>>2)];
   var $802=(($797+$801)|0);
   var $803=(($802)>>>(0)) > (($794)>>>(0));
   if ($803) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $805=(($sp_0_i_i+8)|0);
   var $806=HEAP32[(($805)>>2)];
   var $807=(($806)|(0))==0;
   if ($807) { label = 181; break; } else { var $sp_0_i_i = $806;label = 177; break; }
  case 180: 
   var $808=(($sp_0_i_i)|(0))==0;
   if ($808) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $809=_sbrk(0);
   var $810=(($809)|(0))==-1;
   if ($810) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $812=$809;
   var $813=HEAP32[((((525076)|0))>>2)];
   var $814=((($813)-(1))|0);
   var $815=$814 & $812;
   var $816=(($815)|(0))==0;
   if ($816) { var $ssize_0_i = $776;label = 184; break; } else { label = 183; break; }
  case 183: 
   var $818=((($814)+($812))|0);
   var $819=(((-$813))|0);
   var $820=$818 & $819;
   var $821=((($776)-($812))|0);
   var $822=((($821)+($820))|0);
   var $ssize_0_i = $822;label = 184; break;
  case 184: 
   var $ssize_0_i;
   var $824=HEAP32[((((525544)|0))>>2)];
   var $825=((($824)+($ssize_0_i))|0);
   var $826=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $827=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i131=$826 & $827;
   if ($or_cond_i131) { label = 185; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 185: 
   var $829=HEAP32[((((525552)|0))>>2)];
   var $830=(($829)|(0))==0;
   if ($830) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $832=(($825)>>>(0)) <= (($824)>>>(0));
   var $833=(($825)>>>(0)) > (($829)>>>(0));
   var $or_cond2_i=$832 | $833;
   if ($or_cond2_i) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $835=_sbrk($ssize_0_i);
   var $836=(($835)|(0))==(($809)|(0));
   var $ssize_0__i=$836 ? $ssize_0_i : 0;
   var $__i=$836 ? $809 : -1;
   var $tbase_0_i = $__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $835;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $838=HEAP32[((((525124)|0))>>2)];
   var $839=((($774)-($838))|0);
   var $840=$839 & $775;
   var $841=(($840)>>>(0)) < 2147483647;
   if ($841) { label = 189; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 189: 
   var $843=_sbrk($840);
   var $844=HEAP32[(($796)>>2)];
   var $845=HEAP32[(($800)>>2)];
   var $846=(($844+$845)|0);
   var $847=(($843)|(0))==(($846)|(0));
   var $_3_i=$847 ? $840 : 0;
   var $_4_i=$847 ? $843 : -1;
   var $tbase_0_i = $_4_i;var $tsize_0_i = $_3_i;var $br_0_i = $843;var $ssize_1_i = $840;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $849=(((-$ssize_1_i))|0);
   var $850=(($tbase_0_i)|(0))==-1;
   if ($850) { label = 191; break; } else { var $tsize_244_i = $tsize_0_i;var $tbase_245_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $852=(($br_0_i)|(0))!=-1;
   var $853=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond5_i=$852 & $853;
   var $854=(($ssize_1_i)>>>(0)) < (($771)>>>(0));
   var $or_cond6_i=$or_cond5_i & $854;
   if ($or_cond6_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $856=HEAP32[((((525080)|0))>>2)];
   var $857=((($773)-($ssize_1_i))|0);
   var $858=((($857)+($856))|0);
   var $859=(((-$856))|0);
   var $860=$858 & $859;
   var $861=(($860)>>>(0)) < 2147483647;
   if ($861) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $863=_sbrk($860);
   var $864=(($863)|(0))==-1;
   if ($864) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $866=((($860)+($ssize_1_i))|0);
   var $ssize_2_i = $866;label = 196; break;
  case 195: 
   var $868=_sbrk($849);
   var $tsize_0303639_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $870=(($br_0_i)|(0))==-1;
   if ($870) { var $tsize_0303639_i = $tsize_0_i;label = 197; break; } else { var $tsize_244_i = $ssize_2_i;var $tbase_245_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0303639_i;
   var $871=HEAP32[((((525556)|0))>>2)];
   var $872=$871 | 4;
   HEAP32[((((525556)|0))>>2)]=$872;
   var $tsize_1_i = $tsize_0303639_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $874=(($776)>>>(0)) < 2147483647;
   if ($874) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $876=_sbrk($776);
   var $877=_sbrk(0);
   var $notlhs_i=(($876)|(0))!=-1;
   var $notrhs_i=(($877)|(0))!=-1;
   var $or_cond8_not_i=$notrhs_i & $notlhs_i;
   var $878=(($876)>>>(0)) < (($877)>>>(0));
   var $or_cond9_i=$or_cond8_not_i & $878;
   if ($or_cond9_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $879=$877;
   var $880=$876;
   var $881=((($879)-($880))|0);
   var $882=((($nb_0)+(40))|0);
   var $883=(($881)>>>(0)) > (($882)>>>(0));
   var $_tsize_1_i=$883 ? $881 : $tsize_1_i;
   var $_tbase_1_i=$883 ? $876 : -1;
   var $884=(($_tbase_1_i)|(0))==-1;
   if ($884) { label = 340; break; } else { var $tsize_244_i = $_tsize_1_i;var $tbase_245_i = $_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_245_i;
   var $tsize_244_i;
   var $885=HEAP32[((((525544)|0))>>2)];
   var $886=((($885)+($tsize_244_i))|0);
   HEAP32[((((525544)|0))>>2)]=$886;
   var $887=HEAP32[((((525548)|0))>>2)];
   var $888=(($886)>>>(0)) > (($887)>>>(0));
   if ($888) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((525548)|0))>>2)]=$886;
   label = 203; break;
  case 203: 
   var $890=HEAP32[((((525136)|0))>>2)];
   var $891=(($890)|(0))==0;
   if ($891) { label = 204; break; } else { var $sp_067_i = ((525560)|0);label = 211; break; }
  case 204: 
   var $893=HEAP32[((((525128)|0))>>2)];
   var $894=(($893)|(0))==0;
   var $895=(($tbase_245_i)>>>(0)) < (($893)>>>(0));
   var $or_cond10_i=$894 | $895;
   if ($or_cond10_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((525128)|0))>>2)]=$tbase_245_i;
   label = 206; break;
  case 206: 
   HEAP32[((((525560)|0))>>2)]=$tbase_245_i;
   HEAP32[((((525564)|0))>>2)]=$tsize_244_i;
   HEAP32[((((525572)|0))>>2)]=0;
   var $897=HEAP32[((((525072)|0))>>2)];
   HEAP32[((((525148)|0))>>2)]=$897;
   HEAP32[((((525144)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $899=$i_02_i_i << 1;
   var $900=((525152+($899<<2))|0);
   var $901=$900;
   var $_sum_i_i=((($899)+(3))|0);
   var $902=((525152+($_sum_i_i<<2))|0);
   HEAP32[(($902)>>2)]=$901;
   var $_sum1_i_i=((($899)+(2))|0);
   var $903=((525152+($_sum1_i_i<<2))|0);
   HEAP32[(($903)>>2)]=$901;
   var $904=((($i_02_i_i)+(1))|0);
   var $905=(($904)>>>(0)) < 32;
   if ($905) { var $i_02_i_i = $904;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $906=((($tsize_244_i)-(40))|0);
   var $907=(($tbase_245_i+8)|0);
   var $908=$907;
   var $909=$908 & 7;
   var $910=(($909)|(0))==0;
   if ($910) { var $914 = 0;label = 210; break; } else { label = 209; break; }
  case 209: 
   var $912=(((-$908))|0);
   var $913=$912 & 7;
   var $914 = $913;label = 210; break;
  case 210: 
   var $914;
   var $915=(($tbase_245_i+$914)|0);
   var $916=$915;
   var $917=((($906)-($914))|0);
   HEAP32[((((525136)|0))>>2)]=$916;
   HEAP32[((((525124)|0))>>2)]=$917;
   var $918=$917 | 1;
   var $_sum_i14_i=((($914)+(4))|0);
   var $919=(($tbase_245_i+$_sum_i14_i)|0);
   var $920=$919;
   HEAP32[(($920)>>2)]=$918;
   var $_sum2_i_i=((($tsize_244_i)-(36))|0);
   var $921=(($tbase_245_i+$_sum2_i_i)|0);
   var $922=$921;
   HEAP32[(($922)>>2)]=40;
   var $923=HEAP32[((((525088)|0))>>2)];
   HEAP32[((((525140)|0))>>2)]=$923;
   label = 338; break;
  case 211: 
   var $sp_067_i;
   var $924=(($sp_067_i)|0);
   var $925=HEAP32[(($924)>>2)];
   var $926=(($sp_067_i+4)|0);
   var $927=HEAP32[(($926)>>2)];
   var $928=(($925+$927)|0);
   var $929=(($tbase_245_i)|(0))==(($928)|(0));
   if ($929) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $931=(($sp_067_i+8)|0);
   var $932=HEAP32[(($931)>>2)];
   var $933=(($932)|(0))==0;
   if ($933) { label = 218; break; } else { var $sp_067_i = $932;label = 211; break; }
  case 213: 
   var $934=(($sp_067_i+12)|0);
   var $935=HEAP32[(($934)>>2)];
   var $936=$935 & 8;
   var $937=(($936)|(0))==0;
   if ($937) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $939=$890;
   var $940=(($939)>>>(0)) >= (($925)>>>(0));
   var $941=(($939)>>>(0)) < (($tbase_245_i)>>>(0));
   var $or_cond47_i=$940 & $941;
   if ($or_cond47_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $943=((($927)+($tsize_244_i))|0);
   HEAP32[(($926)>>2)]=$943;
   var $944=HEAP32[((((525136)|0))>>2)];
   var $945=HEAP32[((((525124)|0))>>2)];
   var $946=((($945)+($tsize_244_i))|0);
   var $947=$944;
   var $948=(($944+8)|0);
   var $949=$948;
   var $950=$949 & 7;
   var $951=(($950)|(0))==0;
   if ($951) { var $955 = 0;label = 217; break; } else { label = 216; break; }
  case 216: 
   var $953=(((-$949))|0);
   var $954=$953 & 7;
   var $955 = $954;label = 217; break;
  case 217: 
   var $955;
   var $956=(($947+$955)|0);
   var $957=$956;
   var $958=((($946)-($955))|0);
   HEAP32[((((525136)|0))>>2)]=$957;
   HEAP32[((((525124)|0))>>2)]=$958;
   var $959=$958 | 1;
   var $_sum_i18_i=((($955)+(4))|0);
   var $960=(($947+$_sum_i18_i)|0);
   var $961=$960;
   HEAP32[(($961)>>2)]=$959;
   var $_sum2_i19_i=((($946)+(4))|0);
   var $962=(($947+$_sum2_i19_i)|0);
   var $963=$962;
   HEAP32[(($963)>>2)]=40;
   var $964=HEAP32[((((525088)|0))>>2)];
   HEAP32[((((525140)|0))>>2)]=$964;
   label = 338; break;
  case 218: 
   var $965=HEAP32[((((525128)|0))>>2)];
   var $966=(($tbase_245_i)>>>(0)) < (($965)>>>(0));
   if ($966) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((525128)|0))>>2)]=$tbase_245_i;
   label = 220; break;
  case 220: 
   var $968=(($tbase_245_i+$tsize_244_i)|0);
   var $sp_160_i = ((525560)|0);label = 221; break;
  case 221: 
   var $sp_160_i;
   var $970=(($sp_160_i)|0);
   var $971=HEAP32[(($970)>>2)];
   var $972=(($971)|(0))==(($968)|(0));
   if ($972) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $974=(($sp_160_i+8)|0);
   var $975=HEAP32[(($974)>>2)];
   var $976=(($975)|(0))==0;
   if ($976) { label = 304; break; } else { var $sp_160_i = $975;label = 221; break; }
  case 223: 
   var $977=(($sp_160_i+12)|0);
   var $978=HEAP32[(($977)>>2)];
   var $979=$978 & 8;
   var $980=(($979)|(0))==0;
   if ($980) { label = 224; break; } else { label = 304; break; }
  case 224: 
   HEAP32[(($970)>>2)]=$tbase_245_i;
   var $982=(($sp_160_i+4)|0);
   var $983=HEAP32[(($982)>>2)];
   var $984=((($983)+($tsize_244_i))|0);
   HEAP32[(($982)>>2)]=$984;
   var $985=(($tbase_245_i+8)|0);
   var $986=$985;
   var $987=$986 & 7;
   var $988=(($987)|(0))==0;
   if ($988) { var $993 = 0;label = 226; break; } else { label = 225; break; }
  case 225: 
   var $990=(((-$986))|0);
   var $991=$990 & 7;
   var $993 = $991;label = 226; break;
  case 226: 
   var $993;
   var $994=(($tbase_245_i+$993)|0);
   var $_sum93_i=((($tsize_244_i)+(8))|0);
   var $995=(($tbase_245_i+$_sum93_i)|0);
   var $996=$995;
   var $997=$996 & 7;
   var $998=(($997)|(0))==0;
   if ($998) { var $1003 = 0;label = 228; break; } else { label = 227; break; }
  case 227: 
   var $1000=(((-$996))|0);
   var $1001=$1000 & 7;
   var $1003 = $1001;label = 228; break;
  case 228: 
   var $1003;
   var $_sum94_i=((($1003)+($tsize_244_i))|0);
   var $1004=(($tbase_245_i+$_sum94_i)|0);
   var $1005=$1004;
   var $1006=$1004;
   var $1007=$994;
   var $1008=((($1006)-($1007))|0);
   var $_sum_i21_i=((($993)+($nb_0))|0);
   var $1009=(($tbase_245_i+$_sum_i21_i)|0);
   var $1010=$1009;
   var $1011=((($1008)-($nb_0))|0);
   var $1012=$nb_0 | 3;
   var $_sum1_i22_i=((($993)+(4))|0);
   var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
   var $1014=$1013;
   HEAP32[(($1014)>>2)]=$1012;
   var $1015=HEAP32[((((525136)|0))>>2)];
   var $1016=(($1005)|(0))==(($1015)|(0));
   if ($1016) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $1018=HEAP32[((((525124)|0))>>2)];
   var $1019=((($1018)+($1011))|0);
   HEAP32[((((525124)|0))>>2)]=$1019;
   HEAP32[((((525136)|0))>>2)]=$1010;
   var $1020=$1019 | 1;
   var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
   var $1021=(($tbase_245_i+$_sum46_i_i)|0);
   var $1022=$1021;
   HEAP32[(($1022)>>2)]=$1020;
   label = 303; break;
  case 230: 
   var $1024=HEAP32[((((525132)|0))>>2)];
   var $1025=(($1005)|(0))==(($1024)|(0));
   if ($1025) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $1027=HEAP32[((((525120)|0))>>2)];
   var $1028=((($1027)+($1011))|0);
   HEAP32[((((525120)|0))>>2)]=$1028;
   HEAP32[((((525132)|0))>>2)]=$1010;
   var $1029=$1028 | 1;
   var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
   var $1030=(($tbase_245_i+$_sum44_i_i)|0);
   var $1031=$1030;
   HEAP32[(($1031)>>2)]=$1029;
   var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
   var $1032=(($tbase_245_i+$_sum45_i_i)|0);
   var $1033=$1032;
   HEAP32[(($1033)>>2)]=$1028;
   label = 303; break;
  case 232: 
   var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
   var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
   var $1035=(($tbase_245_i+$_sum95_i)|0);
   var $1036=$1035;
   var $1037=HEAP32[(($1036)>>2)];
   var $1038=$1037 & 3;
   var $1039=(($1038)|(0))==1;
   if ($1039) { label = 233; break; } else { var $oldfirst_0_i_i = $1005;var $qsize_0_i_i = $1011;label = 280; break; }
  case 233: 
   var $1041=$1037 & -8;
   var $1042=$1037 >>> 3;
   var $1043=(($1037)>>>(0)) < 256;
   if ($1043) { label = 234; break; } else { label = 246; break; }
  case 234: 
   var $_sum3940_i_i=$1003 | 8;
   var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
   var $1045=(($tbase_245_i+$_sum105_i)|0);
   var $1046=$1045;
   var $1047=HEAP32[(($1046)>>2)];
   var $_sum41_i_i=((($tsize_244_i)+(12))|0);
   var $_sum106_i=((($_sum41_i_i)+($1003))|0);
   var $1048=(($tbase_245_i+$_sum106_i)|0);
   var $1049=$1048;
   var $1050=HEAP32[(($1049)>>2)];
   var $1051=$1042 << 1;
   var $1052=((525152+($1051<<2))|0);
   var $1053=$1052;
   var $1054=(($1047)|(0))==(($1053)|(0));
   if ($1054) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $1056=$1047;
   var $1057=HEAP32[((((525128)|0))>>2)];
   var $1058=(($1056)>>>(0)) < (($1057)>>>(0));
   if ($1058) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $1060=(($1047+12)|0);
   var $1061=HEAP32[(($1060)>>2)];
   var $1062=(($1061)|(0))==(($1005)|(0));
   if ($1062) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $1063=(($1050)|(0))==(($1047)|(0));
   if ($1063) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $1065=1 << $1042;
   var $1066=$1065 ^ -1;
   var $1067=HEAP32[((((525112)|0))>>2)];
   var $1068=$1067 & $1066;
   HEAP32[((((525112)|0))>>2)]=$1068;
   label = 279; break;
  case 239: 
   var $1070=(($1050)|(0))==(($1053)|(0));
   if ($1070) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $_pre56_i_i=(($1050+8)|0);
   var $_pre_phi57_i_i = $_pre56_i_i;label = 243; break;
  case 241: 
   var $1072=$1050;
   var $1073=HEAP32[((((525128)|0))>>2)];
   var $1074=(($1072)>>>(0)) < (($1073)>>>(0));
   if ($1074) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $1076=(($1050+8)|0);
   var $1077=HEAP32[(($1076)>>2)];
   var $1078=(($1077)|(0))==(($1005)|(0));
   if ($1078) { var $_pre_phi57_i_i = $1076;label = 243; break; } else { label = 244; break; }
  case 243: 
   var $_pre_phi57_i_i;
   var $1079=(($1047+12)|0);
   HEAP32[(($1079)>>2)]=$1050;
   HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
   label = 279; break;
  case 244: 
   _abort();
   throw "Reached an unreachable!";
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   var $1081=$1004;
   var $_sum34_i_i=$1003 | 24;
   var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
   var $1082=(($tbase_245_i+$_sum96_i)|0);
   var $1083=$1082;
   var $1084=HEAP32[(($1083)>>2)];
   var $_sum5_i_i=((($tsize_244_i)+(12))|0);
   var $_sum97_i=((($_sum5_i_i)+($1003))|0);
   var $1085=(($tbase_245_i+$_sum97_i)|0);
   var $1086=$1085;
   var $1087=HEAP32[(($1086)>>2)];
   var $1088=(($1087)|(0))==(($1081)|(0));
   if ($1088) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $_sum3637_i_i=$1003 | 8;
   var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
   var $1090=(($tbase_245_i+$_sum98_i)|0);
   var $1091=$1090;
   var $1092=HEAP32[(($1091)>>2)];
   var $1093=$1092;
   var $1094=HEAP32[((((525128)|0))>>2)];
   var $1095=(($1093)>>>(0)) < (($1094)>>>(0));
   if ($1095) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $1097=(($1092+12)|0);
   var $1098=HEAP32[(($1097)>>2)];
   var $1099=(($1098)|(0))==(($1081)|(0));
   if ($1099) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $1101=(($1087+8)|0);
   var $1102=HEAP32[(($1101)>>2)];
   var $1103=(($1102)|(0))==(($1081)|(0));
   if ($1103) { label = 250; break; } else { label = 251; break; }
  case 250: 
   HEAP32[(($1097)>>2)]=$1087;
   HEAP32[(($1101)>>2)]=$1092;
   var $R_1_i_i = $1087;label = 259; break;
  case 251: 
   _abort();
   throw "Reached an unreachable!";
  case 252: 
   var $_sum67_i_i=$1003 | 16;
   var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
   var $1106=(($tbase_245_i+$_sum103_i)|0);
   var $1107=$1106;
   var $1108=HEAP32[(($1107)>>2)];
   var $1109=(($1108)|(0))==0;
   if ($1109) { label = 253; break; } else { var $R_0_i_i = $1108;var $RP_0_i_i = $1107;label = 254; break; }
  case 253: 
   var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
   var $1111=(($tbase_245_i+$_sum104_i)|0);
   var $1112=$1111;
   var $1113=HEAP32[(($1112)>>2)];
   var $1114=(($1113)|(0))==0;
   if ($1114) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $1113;var $RP_0_i_i = $1112;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $1115=(($R_0_i_i+20)|0);
   var $1116=HEAP32[(($1115)>>2)];
   var $1117=(($1116)|(0))==0;
   if ($1117) { label = 255; break; } else { var $R_0_i_i = $1116;var $RP_0_i_i = $1115;label = 254; break; }
  case 255: 
   var $1119=(($R_0_i_i+16)|0);
   var $1120=HEAP32[(($1119)>>2)];
   var $1121=(($1120)|(0))==0;
   if ($1121) { label = 256; break; } else { var $R_0_i_i = $1120;var $RP_0_i_i = $1119;label = 254; break; }
  case 256: 
   var $1123=$RP_0_i_i;
   var $1124=HEAP32[((((525128)|0))>>2)];
   var $1125=(($1123)>>>(0)) < (($1124)>>>(0));
   if ($1125) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $1129=(($1084)|(0))==0;
   if ($1129) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $_sum31_i_i=((($tsize_244_i)+(28))|0);
   var $_sum99_i=((($_sum31_i_i)+($1003))|0);
   var $1131=(($tbase_245_i+$_sum99_i)|0);
   var $1132=$1131;
   var $1133=HEAP32[(($1132)>>2)];
   var $1134=((525416+($1133<<2))|0);
   var $1135=HEAP32[(($1134)>>2)];
   var $1136=(($1081)|(0))==(($1135)|(0));
   if ($1136) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($1134)>>2)]=$R_1_i_i;
   var $cond_i_i=(($R_1_i_i)|(0))==0;
   if ($cond_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $1138=HEAP32[(($1132)>>2)];
   var $1139=1 << $1138;
   var $1140=$1139 ^ -1;
   var $1141=HEAP32[((((525116)|0))>>2)];
   var $1142=$1141 & $1140;
   HEAP32[((((525116)|0))>>2)]=$1142;
   label = 279; break;
  case 263: 
   var $1144=$1084;
   var $1145=HEAP32[((((525128)|0))>>2)];
   var $1146=(($1144)>>>(0)) < (($1145)>>>(0));
   if ($1146) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $1148=(($1084+16)|0);
   var $1149=HEAP32[(($1148)>>2)];
   var $1150=(($1149)|(0))==(($1081)|(0));
   if ($1150) { label = 265; break; } else { label = 266; break; }
  case 265: 
   HEAP32[(($1148)>>2)]=$R_1_i_i;
   label = 268; break;
  case 266: 
   var $1153=(($1084+20)|0);
   HEAP32[(($1153)>>2)]=$R_1_i_i;
   label = 268; break;
  case 267: 
   _abort();
   throw "Reached an unreachable!";
  case 268: 
   var $1156=(($R_1_i_i)|(0))==0;
   if ($1156) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $1158=$R_1_i_i;
   var $1159=HEAP32[((((525128)|0))>>2)];
   var $1160=(($1158)>>>(0)) < (($1159)>>>(0));
   if ($1160) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $1162=(($R_1_i_i+24)|0);
   HEAP32[(($1162)>>2)]=$1084;
   var $_sum3233_i_i=$1003 | 16;
   var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
   var $1163=(($tbase_245_i+$_sum100_i)|0);
   var $1164=$1163;
   var $1165=HEAP32[(($1164)>>2)];
   var $1166=(($1165)|(0))==0;
   if ($1166) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $1168=$1165;
   var $1169=HEAP32[((((525128)|0))>>2)];
   var $1170=(($1168)>>>(0)) < (($1169)>>>(0));
   if ($1170) { label = 273; break; } else { label = 272; break; }
  case 272: 
   var $1172=(($R_1_i_i+16)|0);
   HEAP32[(($1172)>>2)]=$1165;
   var $1173=(($1165+24)|0);
   HEAP32[(($1173)>>2)]=$R_1_i_i;
   label = 274; break;
  case 273: 
   _abort();
   throw "Reached an unreachable!";
  case 274: 
   var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
   var $1176=(($tbase_245_i+$_sum101_i)|0);
   var $1177=$1176;
   var $1178=HEAP32[(($1177)>>2)];
   var $1179=(($1178)|(0))==0;
   if ($1179) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $1181=$1178;
   var $1182=HEAP32[((((525128)|0))>>2)];
   var $1183=(($1181)>>>(0)) < (($1182)>>>(0));
   if ($1183) { label = 277; break; } else { label = 276; break; }
  case 276: 
   var $1185=(($R_1_i_i+20)|0);
   HEAP32[(($1185)>>2)]=$1178;
   var $1186=(($1178+24)|0);
   HEAP32[(($1186)>>2)]=$R_1_i_i;
   label = 279; break;
  case 277: 
   _abort();
   throw "Reached an unreachable!";
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   var $_sum9_i_i=$1041 | $1003;
   var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
   var $1190=(($tbase_245_i+$_sum102_i)|0);
   var $1191=$1190;
   var $1192=((($1041)+($1011))|0);
   var $oldfirst_0_i_i = $1191;var $qsize_0_i_i = $1192;label = 280; break;
  case 280: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $1194=(($oldfirst_0_i_i+4)|0);
   var $1195=HEAP32[(($1194)>>2)];
   var $1196=$1195 & -2;
   HEAP32[(($1194)>>2)]=$1196;
   var $1197=$qsize_0_i_i | 1;
   var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
   var $1198=(($tbase_245_i+$_sum10_i_i)|0);
   var $1199=$1198;
   HEAP32[(($1199)>>2)]=$1197;
   var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
   var $1200=(($tbase_245_i+$_sum11_i_i)|0);
   var $1201=$1200;
   HEAP32[(($1201)>>2)]=$qsize_0_i_i;
   var $1202=$qsize_0_i_i >>> 3;
   var $1203=(($qsize_0_i_i)>>>(0)) < 256;
   if ($1203) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $1205=$1202 << 1;
   var $1206=((525152+($1205<<2))|0);
   var $1207=$1206;
   var $1208=HEAP32[((((525112)|0))>>2)];
   var $1209=1 << $1202;
   var $1210=$1208 & $1209;
   var $1211=(($1210)|(0))==0;
   if ($1211) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $1213=$1208 | $1209;
   HEAP32[((((525112)|0))>>2)]=$1213;
   var $_sum27_pre_i_i=((($1205)+(2))|0);
   var $_pre_i24_i=((525152+($_sum27_pre_i_i<<2))|0);
   var $F4_0_i_i = $1207;var $_pre_phi_i25_i = $_pre_i24_i;label = 285; break;
  case 283: 
   var $_sum30_i_i=((($1205)+(2))|0);
   var $1215=((525152+($_sum30_i_i<<2))|0);
   var $1216=HEAP32[(($1215)>>2)];
   var $1217=$1216;
   var $1218=HEAP32[((((525128)|0))>>2)];
   var $1219=(($1217)>>>(0)) < (($1218)>>>(0));
   if ($1219) { label = 284; break; } else { var $F4_0_i_i = $1216;var $_pre_phi_i25_i = $1215;label = 285; break; }
  case 284: 
   _abort();
   throw "Reached an unreachable!";
  case 285: 
   var $_pre_phi_i25_i;
   var $F4_0_i_i;
   HEAP32[(($_pre_phi_i25_i)>>2)]=$1010;
   var $1222=(($F4_0_i_i+12)|0);
   HEAP32[(($1222)>>2)]=$1010;
   var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
   var $1223=(($tbase_245_i+$_sum28_i_i)|0);
   var $1224=$1223;
   HEAP32[(($1224)>>2)]=$F4_0_i_i;
   var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
   var $1225=(($tbase_245_i+$_sum29_i_i)|0);
   var $1226=$1225;
   HEAP32[(($1226)>>2)]=$1207;
   label = 303; break;
  case 286: 
   var $1228=$1009;
   var $1229=$qsize_0_i_i >>> 8;
   var $1230=(($1229)|(0))==0;
   if ($1230) { var $I7_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $1232=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($1232) { var $I7_0_i_i = 31;label = 289; break; } else { label = 288; break; }
  case 288: 
   var $1234=((($1229)+(1048320))|0);
   var $1235=$1234 >>> 16;
   var $1236=$1235 & 8;
   var $1237=$1229 << $1236;
   var $1238=((($1237)+(520192))|0);
   var $1239=$1238 >>> 16;
   var $1240=$1239 & 4;
   var $1241=$1240 | $1236;
   var $1242=$1237 << $1240;
   var $1243=((($1242)+(245760))|0);
   var $1244=$1243 >>> 16;
   var $1245=$1244 & 2;
   var $1246=$1241 | $1245;
   var $1247=(((14)-($1246))|0);
   var $1248=$1242 << $1245;
   var $1249=$1248 >>> 15;
   var $1250=((($1247)+($1249))|0);
   var $1251=$1250 << 1;
   var $1252=((($1250)+(7))|0);
   var $1253=$qsize_0_i_i >>> (($1252)>>>(0));
   var $1254=$1253 & 1;
   var $1255=$1254 | $1251;
   var $I7_0_i_i = $1255;label = 289; break;
  case 289: 
   var $I7_0_i_i;
   var $1257=((525416+($I7_0_i_i<<2))|0);
   var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
   var $1258=(($tbase_245_i+$_sum12_i26_i)|0);
   var $1259=$1258;
   HEAP32[(($1259)>>2)]=$I7_0_i_i;
   var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
   var $1260=(($tbase_245_i+$_sum13_i_i)|0);
   var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
   var $1261=(($tbase_245_i+$_sum14_i_i)|0);
   var $1262=$1261;
   HEAP32[(($1262)>>2)]=0;
   var $1263=$1260;
   HEAP32[(($1263)>>2)]=0;
   var $1264=HEAP32[((((525116)|0))>>2)];
   var $1265=1 << $I7_0_i_i;
   var $1266=$1264 & $1265;
   var $1267=(($1266)|(0))==0;
   if ($1267) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $1269=$1264 | $1265;
   HEAP32[((((525116)|0))>>2)]=$1269;
   HEAP32[(($1257)>>2)]=$1228;
   var $1270=$1257;
   var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
   var $1271=(($tbase_245_i+$_sum15_i_i)|0);
   var $1272=$1271;
   HEAP32[(($1272)>>2)]=$1270;
   var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
   var $1273=(($tbase_245_i+$_sum16_i_i)|0);
   var $1274=$1273;
   HEAP32[(($1274)>>2)]=$1228;
   var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
   var $1275=(($tbase_245_i+$_sum17_i_i)|0);
   var $1276=$1275;
   HEAP32[(($1276)>>2)]=$1228;
   label = 303; break;
  case 291: 
   var $1278=HEAP32[(($1257)>>2)];
   var $1279=(($I7_0_i_i)|(0))==31;
   if ($1279) { var $1284 = 0;label = 293; break; } else { label = 292; break; }
  case 292: 
   var $1281=$I7_0_i_i >>> 1;
   var $1282=(((25)-($1281))|0);
   var $1284 = $1282;label = 293; break;
  case 293: 
   var $1284;
   var $1285=$qsize_0_i_i << $1284;
   var $K8_0_i_i = $1285;var $T_0_i27_i = $1278;label = 294; break;
  case 294: 
   var $T_0_i27_i;
   var $K8_0_i_i;
   var $1287=(($T_0_i27_i+4)|0);
   var $1288=HEAP32[(($1287)>>2)];
   var $1289=$1288 & -8;
   var $1290=(($1289)|(0))==(($qsize_0_i_i)|(0));
   if ($1290) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $1292=$K8_0_i_i >>> 31;
   var $1293=(($T_0_i27_i+16+($1292<<2))|0);
   var $1294=HEAP32[(($1293)>>2)];
   var $1295=(($1294)|(0))==0;
   var $1296=$K8_0_i_i << 1;
   if ($1295) { label = 296; break; } else { var $K8_0_i_i = $1296;var $T_0_i27_i = $1294;label = 294; break; }
  case 296: 
   var $1298=$1293;
   var $1299=HEAP32[((((525128)|0))>>2)];
   var $1300=(($1298)>>>(0)) < (($1299)>>>(0));
   if ($1300) { label = 298; break; } else { label = 297; break; }
  case 297: 
   HEAP32[(($1293)>>2)]=$1228;
   var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
   var $1302=(($tbase_245_i+$_sum24_i_i)|0);
   var $1303=$1302;
   HEAP32[(($1303)>>2)]=$T_0_i27_i;
   var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
   var $1304=(($tbase_245_i+$_sum25_i_i)|0);
   var $1305=$1304;
   HEAP32[(($1305)>>2)]=$1228;
   var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
   var $1306=(($tbase_245_i+$_sum26_i_i)|0);
   var $1307=$1306;
   HEAP32[(($1307)>>2)]=$1228;
   label = 303; break;
  case 298: 
   _abort();
   throw "Reached an unreachable!";
  case 299: 
   var $1310=(($T_0_i27_i+8)|0);
   var $1311=HEAP32[(($1310)>>2)];
   var $1312=$T_0_i27_i;
   var $1313=HEAP32[((((525128)|0))>>2)];
   var $1314=(($1312)>>>(0)) < (($1313)>>>(0));
   if ($1314) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $1316=$1311;
   var $1317=(($1316)>>>(0)) < (($1313)>>>(0));
   if ($1317) { label = 302; break; } else { label = 301; break; }
  case 301: 
   var $1319=(($1311+12)|0);
   HEAP32[(($1319)>>2)]=$1228;
   HEAP32[(($1310)>>2)]=$1228;
   var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
   var $1320=(($tbase_245_i+$_sum21_i_i)|0);
   var $1321=$1320;
   HEAP32[(($1321)>>2)]=$1311;
   var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
   var $1322=(($tbase_245_i+$_sum22_i_i)|0);
   var $1323=$1322;
   HEAP32[(($1323)>>2)]=$T_0_i27_i;
   var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
   var $1324=(($tbase_245_i+$_sum23_i_i)|0);
   var $1325=$1324;
   HEAP32[(($1325)>>2)]=0;
   label = 303; break;
  case 302: 
   _abort();
   throw "Reached an unreachable!";
  case 303: 
   var $_sum1819_i_i=$993 | 8;
   var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
   var $mem_0 = $1326;label = 341; break;
  case 304: 
   var $1327=$890;
   var $sp_0_i_i_i = ((525560)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $1329=(($sp_0_i_i_i)|0);
   var $1330=HEAP32[(($1329)>>2)];
   var $1331=(($1330)>>>(0)) > (($1327)>>>(0));
   if ($1331) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $1333=(($sp_0_i_i_i+4)|0);
   var $1334=HEAP32[(($1333)>>2)];
   var $1335=(($1330+$1334)|0);
   var $1336=(($1335)>>>(0)) > (($1327)>>>(0));
   if ($1336) { label = 308; break; } else { label = 307; break; }
  case 307: 
   var $1338=(($sp_0_i_i_i+8)|0);
   var $1339=HEAP32[(($1338)>>2)];
   var $sp_0_i_i_i = $1339;label = 305; break;
  case 308: 
   var $_sum_i15_i=((($1334)-(47))|0);
   var $_sum1_i16_i=((($1334)-(39))|0);
   var $1340=(($1330+$_sum1_i16_i)|0);
   var $1341=$1340;
   var $1342=$1341 & 7;
   var $1343=(($1342)|(0))==0;
   if ($1343) { var $1348 = 0;label = 310; break; } else { label = 309; break; }
  case 309: 
   var $1345=(((-$1341))|0);
   var $1346=$1345 & 7;
   var $1348 = $1346;label = 310; break;
  case 310: 
   var $1348;
   var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
   var $1349=(($1330+$_sum2_i17_i)|0);
   var $1350=(($890+16)|0);
   var $1351=$1350;
   var $1352=(($1349)>>>(0)) < (($1351)>>>(0));
   var $1353=$1352 ? $1327 : $1349;
   var $1354=(($1353+8)|0);
   var $1355=$1354;
   var $1356=((($tsize_244_i)-(40))|0);
   var $1357=(($tbase_245_i+8)|0);
   var $1358=$1357;
   var $1359=$1358 & 7;
   var $1360=(($1359)|(0))==0;
   if ($1360) { var $1364 = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $1362=(((-$1358))|0);
   var $1363=$1362 & 7;
   var $1364 = $1363;label = 312; break;
  case 312: 
   var $1364;
   var $1365=(($tbase_245_i+$1364)|0);
   var $1366=$1365;
   var $1367=((($1356)-($1364))|0);
   HEAP32[((((525136)|0))>>2)]=$1366;
   HEAP32[((((525124)|0))>>2)]=$1367;
   var $1368=$1367 | 1;
   var $_sum_i_i_i=((($1364)+(4))|0);
   var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
   var $1370=$1369;
   HEAP32[(($1370)>>2)]=$1368;
   var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
   var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
   var $1372=$1371;
   HEAP32[(($1372)>>2)]=40;
   var $1373=HEAP32[((((525088)|0))>>2)];
   HEAP32[((((525140)|0))>>2)]=$1373;
   var $1374=(($1353+4)|0);
   var $1375=$1374;
   HEAP32[(($1375)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[(((((525560)|0)))>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((((((525560)|0)))+(4))>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((((((525560)|0)))+(8))>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((((((525560)|0)))+(12))>>2)];
   HEAP32[((((525560)|0))>>2)]=$tbase_245_i;
   HEAP32[((((525564)|0))>>2)]=$tsize_244_i;
   HEAP32[((((525572)|0))>>2)]=0;
   HEAP32[((((525568)|0))>>2)]=$1355;
   var $1376=(($1353+28)|0);
   var $1377=$1376;
   HEAP32[(($1377)>>2)]=7;
   var $1378=(($1353+32)|0);
   var $1379=(($1378)>>>(0)) < (($1335)>>>(0));
   if ($1379) { var $1380 = $1377;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $1380;
   var $1381=(($1380+4)|0);
   HEAP32[(($1381)>>2)]=7;
   var $1382=(($1380+8)|0);
   var $1383=$1382;
   var $1384=(($1383)>>>(0)) < (($1335)>>>(0));
   if ($1384) { var $1380 = $1381;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $1385=(($1353)|(0))==(($1327)|(0));
   if ($1385) { label = 338; break; } else { label = 315; break; }
  case 315: 
   var $1387=$1353;
   var $1388=$890;
   var $1389=((($1387)-($1388))|0);
   var $1390=(($1327+$1389)|0);
   var $_sum3_i_i=((($1389)+(4))|0);
   var $1391=(($1327+$_sum3_i_i)|0);
   var $1392=$1391;
   var $1393=HEAP32[(($1392)>>2)];
   var $1394=$1393 & -2;
   HEAP32[(($1392)>>2)]=$1394;
   var $1395=$1389 | 1;
   var $1396=(($890+4)|0);
   HEAP32[(($1396)>>2)]=$1395;
   var $1397=$1390;
   HEAP32[(($1397)>>2)]=$1389;
   var $1398=$1389 >>> 3;
   var $1399=(($1389)>>>(0)) < 256;
   if ($1399) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $1401=$1398 << 1;
   var $1402=((525152+($1401<<2))|0);
   var $1403=$1402;
   var $1404=HEAP32[((((525112)|0))>>2)];
   var $1405=1 << $1398;
   var $1406=$1404 & $1405;
   var $1407=(($1406)|(0))==0;
   if ($1407) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $1409=$1404 | $1405;
   HEAP32[((((525112)|0))>>2)]=$1409;
   var $_sum11_pre_i_i=((($1401)+(2))|0);
   var $_pre_i_i=((525152+($_sum11_pre_i_i<<2))|0);
   var $F_0_i_i = $1403;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $_sum12_i_i=((($1401)+(2))|0);
   var $1411=((525152+($_sum12_i_i<<2))|0);
   var $1412=HEAP32[(($1411)>>2)];
   var $1413=$1412;
   var $1414=HEAP32[((((525128)|0))>>2)];
   var $1415=(($1413)>>>(0)) < (($1414)>>>(0));
   if ($1415) { label = 319; break; } else { var $F_0_i_i = $1412;var $_pre_phi_i_i = $1411;label = 320; break; }
  case 319: 
   _abort();
   throw "Reached an unreachable!";
  case 320: 
   var $_pre_phi_i_i;
   var $F_0_i_i;
   HEAP32[(($_pre_phi_i_i)>>2)]=$890;
   var $1418=(($F_0_i_i+12)|0);
   HEAP32[(($1418)>>2)]=$890;
   var $1419=(($890+8)|0);
   HEAP32[(($1419)>>2)]=$F_0_i_i;
   var $1420=(($890+12)|0);
   HEAP32[(($1420)>>2)]=$1403;
   label = 338; break;
  case 321: 
   var $1422=$890;
   var $1423=$1389 >>> 8;
   var $1424=(($1423)|(0))==0;
   if ($1424) { var $I1_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $1426=(($1389)>>>(0)) > 16777215;
   if ($1426) { var $I1_0_i_i = 31;label = 324; break; } else { label = 323; break; }
  case 323: 
   var $1428=((($1423)+(1048320))|0);
   var $1429=$1428 >>> 16;
   var $1430=$1429 & 8;
   var $1431=$1423 << $1430;
   var $1432=((($1431)+(520192))|0);
   var $1433=$1432 >>> 16;
   var $1434=$1433 & 4;
   var $1435=$1434 | $1430;
   var $1436=$1431 << $1434;
   var $1437=((($1436)+(245760))|0);
   var $1438=$1437 >>> 16;
   var $1439=$1438 & 2;
   var $1440=$1435 | $1439;
   var $1441=(((14)-($1440))|0);
   var $1442=$1436 << $1439;
   var $1443=$1442 >>> 15;
   var $1444=((($1441)+($1443))|0);
   var $1445=$1444 << 1;
   var $1446=((($1444)+(7))|0);
   var $1447=$1389 >>> (($1446)>>>(0));
   var $1448=$1447 & 1;
   var $1449=$1448 | $1445;
   var $I1_0_i_i = $1449;label = 324; break;
  case 324: 
   var $I1_0_i_i;
   var $1451=((525416+($I1_0_i_i<<2))|0);
   var $1452=(($890+28)|0);
   var $I1_0_c_i_i=$I1_0_i_i;
   HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
   var $1453=(($890+20)|0);
   HEAP32[(($1453)>>2)]=0;
   var $1454=(($890+16)|0);
   HEAP32[(($1454)>>2)]=0;
   var $1455=HEAP32[((((525116)|0))>>2)];
   var $1456=1 << $I1_0_i_i;
   var $1457=$1455 & $1456;
   var $1458=(($1457)|(0))==0;
   if ($1458) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $1460=$1455 | $1456;
   HEAP32[((((525116)|0))>>2)]=$1460;
   HEAP32[(($1451)>>2)]=$1422;
   var $1461=(($890+24)|0);
   var $_c_i_i=$1451;
   HEAP32[(($1461)>>2)]=$_c_i_i;
   var $1462=(($890+12)|0);
   HEAP32[(($1462)>>2)]=$890;
   var $1463=(($890+8)|0);
   HEAP32[(($1463)>>2)]=$890;
   label = 338; break;
  case 326: 
   var $1465=HEAP32[(($1451)>>2)];
   var $1466=(($I1_0_i_i)|(0))==31;
   if ($1466) { var $1471 = 0;label = 328; break; } else { label = 327; break; }
  case 327: 
   var $1468=$I1_0_i_i >>> 1;
   var $1469=(((25)-($1468))|0);
   var $1471 = $1469;label = 328; break;
  case 328: 
   var $1471;
   var $1472=$1389 << $1471;
   var $K2_0_i_i = $1472;var $T_0_i_i = $1465;label = 329; break;
  case 329: 
   var $T_0_i_i;
   var $K2_0_i_i;
   var $1474=(($T_0_i_i+4)|0);
   var $1475=HEAP32[(($1474)>>2)];
   var $1476=$1475 & -8;
   var $1477=(($1476)|(0))==(($1389)|(0));
   if ($1477) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $1479=$K2_0_i_i >>> 31;
   var $1480=(($T_0_i_i+16+($1479<<2))|0);
   var $1481=HEAP32[(($1480)>>2)];
   var $1482=(($1481)|(0))==0;
   var $1483=$K2_0_i_i << 1;
   if ($1482) { label = 331; break; } else { var $K2_0_i_i = $1483;var $T_0_i_i = $1481;label = 329; break; }
  case 331: 
   var $1485=$1480;
   var $1486=HEAP32[((((525128)|0))>>2)];
   var $1487=(($1485)>>>(0)) < (($1486)>>>(0));
   if ($1487) { label = 333; break; } else { label = 332; break; }
  case 332: 
   HEAP32[(($1480)>>2)]=$1422;
   var $1489=(($890+24)|0);
   var $T_0_c8_i_i=$T_0_i_i;
   HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
   var $1490=(($890+12)|0);
   HEAP32[(($1490)>>2)]=$890;
   var $1491=(($890+8)|0);
   HEAP32[(($1491)>>2)]=$890;
   label = 338; break;
  case 333: 
   _abort();
   throw "Reached an unreachable!";
  case 334: 
   var $1494=(($T_0_i_i+8)|0);
   var $1495=HEAP32[(($1494)>>2)];
   var $1496=$T_0_i_i;
   var $1497=HEAP32[((((525128)|0))>>2)];
   var $1498=(($1496)>>>(0)) < (($1497)>>>(0));
   if ($1498) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $1500=$1495;
   var $1501=(($1500)>>>(0)) < (($1497)>>>(0));
   if ($1501) { label = 337; break; } else { label = 336; break; }
  case 336: 
   var $1503=(($1495+12)|0);
   HEAP32[(($1503)>>2)]=$1422;
   HEAP32[(($1494)>>2)]=$1422;
   var $1504=(($890+8)|0);
   var $_c7_i_i=$1495;
   HEAP32[(($1504)>>2)]=$_c7_i_i;
   var $1505=(($890+12)|0);
   var $T_0_c_i_i=$T_0_i_i;
   HEAP32[(($1505)>>2)]=$T_0_c_i_i;
   var $1506=(($890+24)|0);
   HEAP32[(($1506)>>2)]=0;
   label = 338; break;
  case 337: 
   _abort();
   throw "Reached an unreachable!";
  case 338: 
   var $1507=HEAP32[((((525124)|0))>>2)];
   var $1508=(($1507)>>>(0)) > (($nb_0)>>>(0));
   if ($1508) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $1510=((($1507)-($nb_0))|0);
   HEAP32[((((525124)|0))>>2)]=$1510;
   var $1511=HEAP32[((((525136)|0))>>2)];
   var $1512=$1511;
   var $1513=(($1512+$nb_0)|0);
   var $1514=$1513;
   HEAP32[((((525136)|0))>>2)]=$1514;
   var $1515=$1510 | 1;
   var $_sum_i134=((($nb_0)+(4))|0);
   var $1516=(($1512+$_sum_i134)|0);
   var $1517=$1516;
   HEAP32[(($1517)>>2)]=$1515;
   var $1518=$nb_0 | 3;
   var $1519=(($1511+4)|0);
   HEAP32[(($1519)>>2)]=$1518;
   var $1520=(($1511+8)|0);
   var $1521=$1520;
   var $mem_0 = $1521;label = 341; break;
  case 340: 
   var $1522=___errno_location();
   HEAP32[(($1522)>>2)]=12;
   var $mem_0 = 0;label = 341; break;
  case 341: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($mem)|(0))==0;
   if ($1) { label = 140; break; } else { label = 2; break; }
  case 2: 
   var $3=((($mem)-(8))|0);
   var $4=$3;
   var $5=HEAP32[((((525128)|0))>>2)];
   var $6=(($3)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 139; break; } else { label = 3; break; }
  case 3: 
   var $8=((($mem)-(4))|0);
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10 & 3;
   var $12=(($11)|(0))==1;
   if ($12) { label = 139; break; } else { label = 4; break; }
  case 4: 
   var $14=$10 & -8;
   var $_sum=((($14)-(8))|0);
   var $15=(($mem+$_sum)|0);
   var $16=$15;
   var $17=$10 & 1;
   var $18=(($17)|(0))==0;
   if ($18) { label = 5; break; } else { var $p_0 = $4;var $psize_0 = $14;label = 56; break; }
  case 5: 
   var $20=$3;
   var $21=HEAP32[(($20)>>2)];
   var $22=(($11)|(0))==0;
   if ($22) { label = 140; break; } else { label = 6; break; }
  case 6: 
   var $_sum232=(((-8)-($21))|0);
   var $24=(($mem+$_sum232)|0);
   var $25=$24;
   var $26=((($21)+($14))|0);
   var $27=(($24)>>>(0)) < (($5)>>>(0));
   if ($27) { label = 139; break; } else { label = 7; break; }
  case 7: 
   var $29=HEAP32[((((525132)|0))>>2)];
   var $30=(($25)|(0))==(($29)|(0));
   if ($30) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $32=$21 >>> 3;
   var $33=(($21)>>>(0)) < 256;
   if ($33) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $_sum276=((($_sum232)+(8))|0);
   var $35=(($mem+$_sum276)|0);
   var $36=$35;
   var $37=HEAP32[(($36)>>2)];
   var $_sum277=((($_sum232)+(12))|0);
   var $38=(($mem+$_sum277)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $41=$32 << 1;
   var $42=((525152+($41<<2))|0);
   var $43=$42;
   var $44=(($37)|(0))==(($43)|(0));
   if ($44) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $46=$37;
   var $47=(($46)>>>(0)) < (($5)>>>(0));
   if ($47) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $49=(($37+12)|0);
   var $50=HEAP32[(($49)>>2)];
   var $51=(($50)|(0))==(($25)|(0));
   if ($51) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $52=(($40)|(0))==(($37)|(0));
   if ($52) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $54=1 << $32;
   var $55=$54 ^ -1;
   var $56=HEAP32[((((525112)|0))>>2)];
   var $57=$56 & $55;
   HEAP32[((((525112)|0))>>2)]=$57;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 14: 
   var $59=(($40)|(0))==(($43)|(0));
   if ($59) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre305=(($40+8)|0);
   var $_pre_phi306 = $_pre305;label = 18; break;
  case 16: 
   var $61=$40;
   var $62=(($61)>>>(0)) < (($5)>>>(0));
   if ($62) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $64=(($40+8)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==(($25)|(0));
   if ($66) { var $_pre_phi306 = $64;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $_pre_phi306;
   var $67=(($37+12)|0);
   HEAP32[(($67)>>2)]=$40;
   HEAP32[(($_pre_phi306)>>2)]=$37;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $69=$24;
   var $_sum266=((($_sum232)+(24))|0);
   var $70=(($mem+$_sum266)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $_sum267=((($_sum232)+(12))|0);
   var $73=(($mem+$_sum267)|0);
   var $74=$73;
   var $75=HEAP32[(($74)>>2)];
   var $76=(($75)|(0))==(($69)|(0));
   if ($76) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $_sum273=((($_sum232)+(8))|0);
   var $78=(($mem+$_sum273)|0);
   var $79=$78;
   var $80=HEAP32[(($79)>>2)];
   var $81=$80;
   var $82=(($81)>>>(0)) < (($5)>>>(0));
   if ($82) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $84=(($80+12)|0);
   var $85=HEAP32[(($84)>>2)];
   var $86=(($85)|(0))==(($69)|(0));
   if ($86) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $88=(($75+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($89)|(0))==(($69)|(0));
   if ($90) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($84)>>2)]=$75;
   HEAP32[(($88)>>2)]=$80;
   var $R_1 = $75;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $_sum269=((($_sum232)+(20))|0);
   var $93=(($mem+$_sum269)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 28; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 29; break; }
  case 28: 
   var $_sum268=((($_sum232)+(16))|0);
   var $98=(($mem+$_sum268)|0);
   var $99=$98;
   var $100=HEAP32[(($99)>>2)];
   var $101=(($100)|(0))==0;
   if ($101) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $100;var $RP_0 = $99;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $102=(($R_0+20)|0);
   var $103=HEAP32[(($102)>>2)];
   var $104=(($103)|(0))==0;
   if ($104) { label = 30; break; } else { var $R_0 = $103;var $RP_0 = $102;label = 29; break; }
  case 30: 
   var $106=(($R_0+16)|0);
   var $107=HEAP32[(($106)>>2)];
   var $108=(($107)|(0))==0;
   if ($108) { label = 31; break; } else { var $R_0 = $107;var $RP_0 = $106;label = 29; break; }
  case 31: 
   var $110=$RP_0;
   var $111=(($110)>>>(0)) < (($5)>>>(0));
   if ($111) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $115=(($72)|(0))==0;
   if ($115) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $_sum270=((($_sum232)+(28))|0);
   var $117=(($mem+$_sum270)|0);
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=((525416+($119<<2))|0);
   var $121=HEAP32[(($120)>>2)];
   var $122=(($69)|(0))==(($121)|(0));
   if ($122) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($120)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $124=HEAP32[(($118)>>2)];
   var $125=1 << $124;
   var $126=$125 ^ -1;
   var $127=HEAP32[((((525116)|0))>>2)];
   var $128=$127 & $126;
   HEAP32[((((525116)|0))>>2)]=$128;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 38: 
   var $130=$72;
   var $131=HEAP32[((((525128)|0))>>2)];
   var $132=(($130)>>>(0)) < (($131)>>>(0));
   if ($132) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $134=(($72+16)|0);
   var $135=HEAP32[(($134)>>2)];
   var $136=(($135)|(0))==(($69)|(0));
   if ($136) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($134)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $139=(($72+20)|0);
   HEAP32[(($139)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $142=(($R_1)|(0))==0;
   if ($142) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $144=$R_1;
   var $145=HEAP32[((((525128)|0))>>2)];
   var $146=(($144)>>>(0)) < (($145)>>>(0));
   if ($146) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $148=(($R_1+24)|0);
   HEAP32[(($148)>>2)]=$72;
   var $_sum271=((($_sum232)+(16))|0);
   var $149=(($mem+$_sum271)|0);
   var $150=$149;
   var $151=HEAP32[(($150)>>2)];
   var $152=(($151)|(0))==0;
   if ($152) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $154=$151;
   var $155=HEAP32[((((525128)|0))>>2)];
   var $156=(($154)>>>(0)) < (($155)>>>(0));
   if ($156) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $158=(($R_1+16)|0);
   HEAP32[(($158)>>2)]=$151;
   var $159=(($151+24)|0);
   HEAP32[(($159)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $_sum272=((($_sum232)+(20))|0);
   var $162=(($mem+$_sum272)|0);
   var $163=$162;
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==0;
   if ($165) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $167=$164;
   var $168=HEAP32[((((525128)|0))>>2)];
   var $169=(($167)>>>(0)) < (($168)>>>(0));
   if ($169) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $171=(($R_1+20)|0);
   HEAP32[(($171)>>2)]=$164;
   var $172=(($164+24)|0);
   HEAP32[(($172)>>2)]=$R_1;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $_sum233=((($14)-(4))|0);
   var $176=(($mem+$_sum233)|0);
   var $177=$176;
   var $178=HEAP32[(($177)>>2)];
   var $179=$178 & 3;
   var $180=(($179)|(0))==3;
   if ($180) { label = 55; break; } else { var $p_0 = $25;var $psize_0 = $26;label = 56; break; }
  case 55: 
   HEAP32[((((525120)|0))>>2)]=$26;
   var $182=HEAP32[(($177)>>2)];
   var $183=$182 & -2;
   HEAP32[(($177)>>2)]=$183;
   var $184=$26 | 1;
   var $_sum264=((($_sum232)+(4))|0);
   var $185=(($mem+$_sum264)|0);
   var $186=$185;
   HEAP32[(($186)>>2)]=$184;
   var $187=$15;
   HEAP32[(($187)>>2)]=$26;
   label = 140; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $189=$p_0;
   var $190=(($189)>>>(0)) < (($15)>>>(0));
   if ($190) { label = 57; break; } else { label = 139; break; }
  case 57: 
   var $_sum263=((($14)-(4))|0);
   var $192=(($mem+$_sum263)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 & 1;
   var $phitmp=(($195)|(0))==0;
   if ($phitmp) { label = 139; break; } else { label = 58; break; }
  case 58: 
   var $197=$194 & 2;
   var $198=(($197)|(0))==0;
   if ($198) { label = 59; break; } else { label = 112; break; }
  case 59: 
   var $200=HEAP32[((((525136)|0))>>2)];
   var $201=(($16)|(0))==(($200)|(0));
   if ($201) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $203=HEAP32[((((525124)|0))>>2)];
   var $204=((($203)+($psize_0))|0);
   HEAP32[((((525124)|0))>>2)]=$204;
   HEAP32[((((525136)|0))>>2)]=$p_0;
   var $205=$204 | 1;
   var $206=(($p_0+4)|0);
   HEAP32[(($206)>>2)]=$205;
   var $207=HEAP32[((((525132)|0))>>2)];
   var $208=(($p_0)|(0))==(($207)|(0));
   if ($208) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((525132)|0))>>2)]=0;
   HEAP32[((((525120)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $211=HEAP32[((((525132)|0))>>2)];
   var $212=(($16)|(0))==(($211)|(0));
   if ($212) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $214=HEAP32[((((525120)|0))>>2)];
   var $215=((($214)+($psize_0))|0);
   HEAP32[((((525120)|0))>>2)]=$215;
   HEAP32[((((525132)|0))>>2)]=$p_0;
   var $216=$215 | 1;
   var $217=(($p_0+4)|0);
   HEAP32[(($217)>>2)]=$216;
   var $218=(($189+$215)|0);
   var $219=$218;
   HEAP32[(($219)>>2)]=$215;
   label = 140; break;
  case 64: 
   var $221=$194 & -8;
   var $222=((($221)+($psize_0))|0);
   var $223=$194 >>> 3;
   var $224=(($194)>>>(0)) < 256;
   if ($224) { label = 65; break; } else { label = 77; break; }
  case 65: 
   var $226=(($mem+$14)|0);
   var $227=$226;
   var $228=HEAP32[(($227)>>2)];
   var $_sum257258=$14 | 4;
   var $229=(($mem+$_sum257258)|0);
   var $230=$229;
   var $231=HEAP32[(($230)>>2)];
   var $232=$223 << 1;
   var $233=((525152+($232<<2))|0);
   var $234=$233;
   var $235=(($228)|(0))==(($234)|(0));
   if ($235) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $237=$228;
   var $238=HEAP32[((((525128)|0))>>2)];
   var $239=(($237)>>>(0)) < (($238)>>>(0));
   if ($239) { label = 76; break; } else { label = 67; break; }
  case 67: 
   var $241=(($228+12)|0);
   var $242=HEAP32[(($241)>>2)];
   var $243=(($242)|(0))==(($16)|(0));
   if ($243) { label = 68; break; } else { label = 76; break; }
  case 68: 
   var $244=(($231)|(0))==(($228)|(0));
   if ($244) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $246=1 << $223;
   var $247=$246 ^ -1;
   var $248=HEAP32[((((525112)|0))>>2)];
   var $249=$248 & $247;
   HEAP32[((((525112)|0))>>2)]=$249;
   label = 110; break;
  case 70: 
   var $251=(($231)|(0))==(($234)|(0));
   if ($251) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $_pre303=(($231+8)|0);
   var $_pre_phi304 = $_pre303;label = 74; break;
  case 72: 
   var $253=$231;
   var $254=HEAP32[((((525128)|0))>>2)];
   var $255=(($253)>>>(0)) < (($254)>>>(0));
   if ($255) { label = 75; break; } else { label = 73; break; }
  case 73: 
   var $257=(($231+8)|0);
   var $258=HEAP32[(($257)>>2)];
   var $259=(($258)|(0))==(($16)|(0));
   if ($259) { var $_pre_phi304 = $257;label = 74; break; } else { label = 75; break; }
  case 74: 
   var $_pre_phi304;
   var $260=(($228+12)|0);
   HEAP32[(($260)>>2)]=$231;
   HEAP32[(($_pre_phi304)>>2)]=$228;
   label = 110; break;
  case 75: 
   _abort();
   throw "Reached an unreachable!";
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $262=$15;
   var $_sum235=((($14)+(16))|0);
   var $263=(($mem+$_sum235)|0);
   var $264=$263;
   var $265=HEAP32[(($264)>>2)];
   var $_sum236237=$14 | 4;
   var $266=(($mem+$_sum236237)|0);
   var $267=$266;
   var $268=HEAP32[(($267)>>2)];
   var $269=(($268)|(0))==(($262)|(0));
   if ($269) { label = 83; break; } else { label = 78; break; }
  case 78: 
   var $271=(($mem+$14)|0);
   var $272=$271;
   var $273=HEAP32[(($272)>>2)];
   var $274=$273;
   var $275=HEAP32[((((525128)|0))>>2)];
   var $276=(($274)>>>(0)) < (($275)>>>(0));
   if ($276) { label = 82; break; } else { label = 79; break; }
  case 79: 
   var $278=(($273+12)|0);
   var $279=HEAP32[(($278)>>2)];
   var $280=(($279)|(0))==(($262)|(0));
   if ($280) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $282=(($268+8)|0);
   var $283=HEAP32[(($282)>>2)];
   var $284=(($283)|(0))==(($262)|(0));
   if ($284) { label = 81; break; } else { label = 82; break; }
  case 81: 
   HEAP32[(($278)>>2)]=$268;
   HEAP32[(($282)>>2)]=$273;
   var $R7_1 = $268;label = 90; break;
  case 82: 
   _abort();
   throw "Reached an unreachable!";
  case 83: 
   var $_sum239=((($14)+(12))|0);
   var $287=(($mem+$_sum239)|0);
   var $288=$287;
   var $289=HEAP32[(($288)>>2)];
   var $290=(($289)|(0))==0;
   if ($290) { label = 84; break; } else { var $R7_0 = $289;var $RP9_0 = $288;label = 85; break; }
  case 84: 
   var $_sum238=((($14)+(8))|0);
   var $292=(($mem+$_sum238)|0);
   var $293=$292;
   var $294=HEAP32[(($293)>>2)];
   var $295=(($294)|(0))==0;
   if ($295) { var $R7_1 = 0;label = 90; break; } else { var $R7_0 = $294;var $RP9_0 = $293;label = 85; break; }
  case 85: 
   var $RP9_0;
   var $R7_0;
   var $296=(($R7_0+20)|0);
   var $297=HEAP32[(($296)>>2)];
   var $298=(($297)|(0))==0;
   if ($298) { label = 86; break; } else { var $R7_0 = $297;var $RP9_0 = $296;label = 85; break; }
  case 86: 
   var $300=(($R7_0+16)|0);
   var $301=HEAP32[(($300)>>2)];
   var $302=(($301)|(0))==0;
   if ($302) { label = 87; break; } else { var $R7_0 = $301;var $RP9_0 = $300;label = 85; break; }
  case 87: 
   var $304=$RP9_0;
   var $305=HEAP32[((((525128)|0))>>2)];
   var $306=(($304)>>>(0)) < (($305)>>>(0));
   if ($306) { label = 89; break; } else { label = 88; break; }
  case 88: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 90; break;
  case 89: 
   _abort();
   throw "Reached an unreachable!";
  case 90: 
   var $R7_1;
   var $310=(($265)|(0))==0;
   if ($310) { label = 110; break; } else { label = 91; break; }
  case 91: 
   var $_sum250=((($14)+(20))|0);
   var $312=(($mem+$_sum250)|0);
   var $313=$312;
   var $314=HEAP32[(($313)>>2)];
   var $315=((525416+($314<<2))|0);
   var $316=HEAP32[(($315)>>2)];
   var $317=(($262)|(0))==(($316)|(0));
   if ($317) { label = 92; break; } else { label = 94; break; }
  case 92: 
   HEAP32[(($315)>>2)]=$R7_1;
   var $cond298=(($R7_1)|(0))==0;
   if ($cond298) { label = 93; break; } else { label = 100; break; }
  case 93: 
   var $319=HEAP32[(($313)>>2)];
   var $320=1 << $319;
   var $321=$320 ^ -1;
   var $322=HEAP32[((((525116)|0))>>2)];
   var $323=$322 & $321;
   HEAP32[((((525116)|0))>>2)]=$323;
   label = 110; break;
  case 94: 
   var $325=$265;
   var $326=HEAP32[((((525128)|0))>>2)];
   var $327=(($325)>>>(0)) < (($326)>>>(0));
   if ($327) { label = 98; break; } else { label = 95; break; }
  case 95: 
   var $329=(($265+16)|0);
   var $330=HEAP32[(($329)>>2)];
   var $331=(($330)|(0))==(($262)|(0));
   if ($331) { label = 96; break; } else { label = 97; break; }
  case 96: 
   HEAP32[(($329)>>2)]=$R7_1;
   label = 99; break;
  case 97: 
   var $334=(($265+20)|0);
   HEAP32[(($334)>>2)]=$R7_1;
   label = 99; break;
  case 98: 
   _abort();
   throw "Reached an unreachable!";
  case 99: 
   var $337=(($R7_1)|(0))==0;
   if ($337) { label = 110; break; } else { label = 100; break; }
  case 100: 
   var $339=$R7_1;
   var $340=HEAP32[((((525128)|0))>>2)];
   var $341=(($339)>>>(0)) < (($340)>>>(0));
   if ($341) { label = 109; break; } else { label = 101; break; }
  case 101: 
   var $343=(($R7_1+24)|0);
   HEAP32[(($343)>>2)]=$265;
   var $_sum251=((($14)+(8))|0);
   var $344=(($mem+$_sum251)|0);
   var $345=$344;
   var $346=HEAP32[(($345)>>2)];
   var $347=(($346)|(0))==0;
   if ($347) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $349=$346;
   var $350=HEAP32[((((525128)|0))>>2)];
   var $351=(($349)>>>(0)) < (($350)>>>(0));
   if ($351) { label = 104; break; } else { label = 103; break; }
  case 103: 
   var $353=(($R7_1+16)|0);
   HEAP32[(($353)>>2)]=$346;
   var $354=(($346+24)|0);
   HEAP32[(($354)>>2)]=$R7_1;
   label = 105; break;
  case 104: 
   _abort();
   throw "Reached an unreachable!";
  case 105: 
   var $_sum252=((($14)+(12))|0);
   var $357=(($mem+$_sum252)|0);
   var $358=$357;
   var $359=HEAP32[(($358)>>2)];
   var $360=(($359)|(0))==0;
   if ($360) { label = 110; break; } else { label = 106; break; }
  case 106: 
   var $362=$359;
   var $363=HEAP32[((((525128)|0))>>2)];
   var $364=(($362)>>>(0)) < (($363)>>>(0));
   if ($364) { label = 108; break; } else { label = 107; break; }
  case 107: 
   var $366=(($R7_1+20)|0);
   HEAP32[(($366)>>2)]=$359;
   var $367=(($359+24)|0);
   HEAP32[(($367)>>2)]=$R7_1;
   label = 110; break;
  case 108: 
   _abort();
   throw "Reached an unreachable!";
  case 109: 
   _abort();
   throw "Reached an unreachable!";
  case 110: 
   var $371=$222 | 1;
   var $372=(($p_0+4)|0);
   HEAP32[(($372)>>2)]=$371;
   var $373=(($189+$222)|0);
   var $374=$373;
   HEAP32[(($374)>>2)]=$222;
   var $375=HEAP32[((((525132)|0))>>2)];
   var $376=(($p_0)|(0))==(($375)|(0));
   if ($376) { label = 111; break; } else { var $psize_1 = $222;label = 113; break; }
  case 111: 
   HEAP32[((((525120)|0))>>2)]=$222;
   label = 140; break;
  case 112: 
   var $379=$194 & -2;
   HEAP32[(($193)>>2)]=$379;
   var $380=$psize_0 | 1;
   var $381=(($p_0+4)|0);
   HEAP32[(($381)>>2)]=$380;
   var $382=(($189+$psize_0)|0);
   var $383=$382;
   HEAP32[(($383)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 113; break;
  case 113: 
   var $psize_1;
   var $385=$psize_1 >>> 3;
   var $386=(($psize_1)>>>(0)) < 256;
   if ($386) { label = 114; break; } else { label = 119; break; }
  case 114: 
   var $388=$385 << 1;
   var $389=((525152+($388<<2))|0);
   var $390=$389;
   var $391=HEAP32[((((525112)|0))>>2)];
   var $392=1 << $385;
   var $393=$391 & $392;
   var $394=(($393)|(0))==0;
   if ($394) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $396=$391 | $392;
   HEAP32[((((525112)|0))>>2)]=$396;
   var $_sum248_pre=((($388)+(2))|0);
   var $_pre=((525152+($_sum248_pre<<2))|0);
   var $F16_0 = $390;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $_sum249=((($388)+(2))|0);
   var $398=((525152+($_sum249<<2))|0);
   var $399=HEAP32[(($398)>>2)];
   var $400=$399;
   var $401=HEAP32[((((525128)|0))>>2)];
   var $402=(($400)>>>(0)) < (($401)>>>(0));
   if ($402) { label = 117; break; } else { var $F16_0 = $399;var $_pre_phi = $398;label = 118; break; }
  case 117: 
   _abort();
   throw "Reached an unreachable!";
  case 118: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $405=(($F16_0+12)|0);
   HEAP32[(($405)>>2)]=$p_0;
   var $406=(($p_0+8)|0);
   HEAP32[(($406)>>2)]=$F16_0;
   var $407=(($p_0+12)|0);
   HEAP32[(($407)>>2)]=$390;
   label = 140; break;
  case 119: 
   var $409=$p_0;
   var $410=$psize_1 >>> 8;
   var $411=(($410)|(0))==0;
   if ($411) { var $I18_0 = 0;label = 122; break; } else { label = 120; break; }
  case 120: 
   var $413=(($psize_1)>>>(0)) > 16777215;
   if ($413) { var $I18_0 = 31;label = 122; break; } else { label = 121; break; }
  case 121: 
   var $415=((($410)+(1048320))|0);
   var $416=$415 >>> 16;
   var $417=$416 & 8;
   var $418=$410 << $417;
   var $419=((($418)+(520192))|0);
   var $420=$419 >>> 16;
   var $421=$420 & 4;
   var $422=$421 | $417;
   var $423=$418 << $421;
   var $424=((($423)+(245760))|0);
   var $425=$424 >>> 16;
   var $426=$425 & 2;
   var $427=$422 | $426;
   var $428=(((14)-($427))|0);
   var $429=$423 << $426;
   var $430=$429 >>> 15;
   var $431=((($428)+($430))|0);
   var $432=$431 << 1;
   var $433=((($431)+(7))|0);
   var $434=$psize_1 >>> (($433)>>>(0));
   var $435=$434 & 1;
   var $436=$435 | $432;
   var $I18_0 = $436;label = 122; break;
  case 122: 
   var $I18_0;
   var $438=((525416+($I18_0<<2))|0);
   var $439=(($p_0+28)|0);
   var $I18_0_c=$I18_0;
   HEAP32[(($439)>>2)]=$I18_0_c;
   var $440=(($p_0+20)|0);
   HEAP32[(($440)>>2)]=0;
   var $441=(($p_0+16)|0);
   HEAP32[(($441)>>2)]=0;
   var $442=HEAP32[((((525116)|0))>>2)];
   var $443=1 << $I18_0;
   var $444=$442 & $443;
   var $445=(($444)|(0))==0;
   if ($445) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $447=$442 | $443;
   HEAP32[((((525116)|0))>>2)]=$447;
   HEAP32[(($438)>>2)]=$409;
   var $448=(($p_0+24)|0);
   var $_c=$438;
   HEAP32[(($448)>>2)]=$_c;
   var $449=(($p_0+12)|0);
   HEAP32[(($449)>>2)]=$p_0;
   var $450=(($p_0+8)|0);
   HEAP32[(($450)>>2)]=$p_0;
   label = 136; break;
  case 124: 
   var $452=HEAP32[(($438)>>2)];
   var $453=(($I18_0)|(0))==31;
   if ($453) { var $458 = 0;label = 126; break; } else { label = 125; break; }
  case 125: 
   var $455=$I18_0 >>> 1;
   var $456=(((25)-($455))|0);
   var $458 = $456;label = 126; break;
  case 126: 
   var $458;
   var $459=$psize_1 << $458;
   var $K19_0 = $459;var $T_0 = $452;label = 127; break;
  case 127: 
   var $T_0;
   var $K19_0;
   var $461=(($T_0+4)|0);
   var $462=HEAP32[(($461)>>2)];
   var $463=$462 & -8;
   var $464=(($463)|(0))==(($psize_1)|(0));
   if ($464) { label = 132; break; } else { label = 128; break; }
  case 128: 
   var $466=$K19_0 >>> 31;
   var $467=(($T_0+16+($466<<2))|0);
   var $468=HEAP32[(($467)>>2)];
   var $469=(($468)|(0))==0;
   var $470=$K19_0 << 1;
   if ($469) { label = 129; break; } else { var $K19_0 = $470;var $T_0 = $468;label = 127; break; }
  case 129: 
   var $472=$467;
   var $473=HEAP32[((((525128)|0))>>2)];
   var $474=(($472)>>>(0)) < (($473)>>>(0));
   if ($474) { label = 131; break; } else { label = 130; break; }
  case 130: 
   HEAP32[(($467)>>2)]=$409;
   var $476=(($p_0+24)|0);
   var $T_0_c245=$T_0;
   HEAP32[(($476)>>2)]=$T_0_c245;
   var $477=(($p_0+12)|0);
   HEAP32[(($477)>>2)]=$p_0;
   var $478=(($p_0+8)|0);
   HEAP32[(($478)>>2)]=$p_0;
   label = 136; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   var $481=(($T_0+8)|0);
   var $482=HEAP32[(($481)>>2)];
   var $483=$T_0;
   var $484=HEAP32[((((525128)|0))>>2)];
   var $485=(($483)>>>(0)) < (($484)>>>(0));
   if ($485) { label = 135; break; } else { label = 133; break; }
  case 133: 
   var $487=$482;
   var $488=(($487)>>>(0)) < (($484)>>>(0));
   if ($488) { label = 135; break; } else { label = 134; break; }
  case 134: 
   var $490=(($482+12)|0);
   HEAP32[(($490)>>2)]=$409;
   HEAP32[(($481)>>2)]=$409;
   var $491=(($p_0+8)|0);
   var $_c244=$482;
   HEAP32[(($491)>>2)]=$_c244;
   var $492=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($492)>>2)]=$T_0_c;
   var $493=(($p_0+24)|0);
   HEAP32[(($493)>>2)]=0;
   label = 136; break;
  case 135: 
   _abort();
   throw "Reached an unreachable!";
  case 136: 
   var $495=HEAP32[((((525144)|0))>>2)];
   var $496=((($495)-(1))|0);
   HEAP32[((((525144)|0))>>2)]=$496;
   var $497=(($496)|(0))==0;
   if ($497) { var $sp_0_in_i = ((525568)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $498=(($sp_0_i)|(0))==0;
   var $499=(($sp_0_i+8)|0);
   if ($498) { label = 138; break; } else { var $sp_0_in_i = $499;label = 137; break; }
  case 138: 
   HEAP32[((((525144)|0))>>2)]=-1;
   label = 140; break;
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
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
//@ sourceMappingURL=prout-no-op.js.map