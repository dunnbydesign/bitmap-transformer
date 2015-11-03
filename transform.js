var fs = require('fs')

function colorTransformer (err, data) {
  if (err || process.argv[2].slice(-4) !== '.bmp') {
    console.error('Error: unable to transform file')
  } else {
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

    var cond1 = headerField !== 'BM'
    var cond2 = fileByteLength !== fileBufferLength
    var cond3 = pixelArrayByteLength <= 0
    var cond4 = (14 + dibHeaderByteLength) > pixelArrayByteOffset
    var cond5 = bitsPerPixel < 8
    var cond6 = [8, 16, 24, 32].indexOf(bitsPerPixel) === -1

    if (cond1 || cond2 || cond3 || cond4 || cond5 || cond6) {
      console.error('Error: unable to transform file')
    } else {
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

      var rowByteLength = pixelArrayByteLength / bitmapPixelHeight
      for (var currentRow = 0; currentRow < bitmapPixelHeight; currentRow++) {
        var startOfRow = pixelArrayByteOffset + currentRow * rowByteLength
        for (var index = startOfRow; index < startOfRow + (pixelByteLength * bitmapPixelWidth); index++) {
          data[index] = 0xFF - data[index] // invert color
        }
      }

      fs.writeFile('./' + process.argv[2].slice(0, process.argv[2].length - 4) + '_transformed' + process.argv[2].slice(-4), data, function (err, data) {
        if (err) console.log(err)
      })
    }
  }
}

fs.readFile('./' + process.argv[2], colorTransformer)

module.exports.colorTransformer = colorTransformer
