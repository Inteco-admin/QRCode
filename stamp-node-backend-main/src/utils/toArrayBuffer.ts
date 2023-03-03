export function toArrayBuffer(myBuf): ArrayBuffer {
  var myBuffer = new ArrayBuffer(myBuf.length)
  var res = new Uint8Array(myBuffer)
  for (var i = 0; i < myBuf.length; ++i) {
    res[i] = myBuf[i]
  }
  return myBuffer
}
