/* global describe, it */

var fs = require('fs')
var expect = require('chai').expect
var colorTransformer = require('../transform.js').colorTransformer

describe('colorTransformer', function () {
  it('should keep the main file properties in tact in the transformed version of the bitmap file', function (done) {
    var obj = fs.readFile('./samples/crayons.bmp', colorTransformer)

    function checkFileInfo () {
      fs.readFile('./samples/crayons_transformed.bmp', function (err, data) {
        var headerField = data.slice(0, 2).toString('ascii')
        var fileByteLength = data.readUIntLE(2, 6)
        var fileBufferLength = data.length
        var pixelArrayByteOffset = data.readUIntLE(10, 4)
        var dibHeaderByteLength = data.readUIntLE(14, 4)
        var pixelArrayByteLength = fileByteLength - pixelArrayByteOffset
        expect(headerField).to.equal(obj.headerField)
        expect(fileByteLength).to.equal(obj.fileByteLength)
        expect(fileBufferLength).to.equal(obj.fileBufferLength)
        expect(pixelArrayByteOffset).to.equal(obj.pixelArrayByteOffset)
        expect(dibHeaderByteLength).to.equal(obj.dibHeaderByteLength)
        expect(pixelArrayByteLength).to.equal(obj.pixelArrayByteLength)
        done()
      })
    }
    setTimeout(checkFileInfo, 3000)
  })
})

// invert file that was inverted and see it that matches the original file, in full
// check that error: true is returned in the appropriate cases
// test case for vortex?
