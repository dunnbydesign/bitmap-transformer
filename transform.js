var fs = require('fs')

function colorTransformer (err, data) { // data is a buffer
  // if err, then do not transform file

  var headerField = data.slice(0, 2).toString('ascii')
  var fileByteLength = data.readUIntLE(2, 6)
  var fileBufferLength = data.length
  var pixelArrayByteOffset = data.readUIntLE(10, 4)
  var dibHeaderByteLength = data.readUIntLE(14, 4)
  var pixelArrayByteLength = fileByteLength - pixelArrayByteOffset
  var bitmapPixelWidth
  var bitmapPixelHeight
  var bitsPerPixel

  if (dibHeaderByteLength === 12) {
    bitmapPixelWidth = data.readUIntLE(18, 2)
    bitmapPixelHeight = Math.abs(data.readUIntLE(20, 2))
    bitsPerPixel = data.readUIntLE(24, 2)
  } else if (dibHeaderByteLength === 40) {
    bitmapPixelWidth = data.readIntLE(18, 4)
    bitmapPixelHeight = Math.abs(data.readIntLE(22, 4))
    bitsPerPixel = data.readIntLE(28, 2)
  }

  // if headerField !== 'BM', then do not transform file
  // if fileByteLength !== fileBufferLength, then do not transform file
  // if pixelArrayByteLength <= 0, then do not transform file
  // if (14 + dibHeaderByteLength) > pixelArrayByteOffset, then do not transform file
  // if bitsPerPixel < 8 || [8, 16, 24, 32].indexOf(bitsPerPixel) === -1, then do not transform file

  var pixelByteLength
  switch (bitsPerPixel) {
    case 8:
      pixelByteLength = 1
      break
    case 16:
      pixelByteLength = 2
      break
    case 24:
      pixelByteLength = 3
      break
    case 32:
      pixelByteLength = 4
      break
    default:
      console.error('Unknown number of bits per pixel')
  }

  // var paddingByteLength
  // if ((pixelByteLength * bitmapPixelWidth) % 4 === 0) {  // pixelByteLength * bitmapPixelWidth: number of bytes within a row that contain pixel data
  //   paddingByteLength = 0
  // } else {
  //   paddingByteLength = 4 - ((pixelByteLength * bitmapPixelWidth) % 4)
  // }

  var rowByteLength = pixelArrayByteLength / bitmapPixelHeight
  for (var currentRow = 0; currentRow < bitmapPixelHeight; currentRow++) {
    var startOfRow = pixelArrayByteOffset + currentRow * rowByteLength
    for (var index = startOfRow; index < startOfRow + (pixelByteLength * bitmapPixelWidth); index++) {
      data[index] = 0xFF - data[index] // invert color
    }
  }

  fs.writeFile('./transformed_' + process.argv[2], data, function (err, data) {
    if (err) console.log(err)
  })
}

fs.readFile('./' + process.argv[2], colorTransformer)
