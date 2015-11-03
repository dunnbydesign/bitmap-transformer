/* global describe, it */

var fs = require('fs')
var exec = require('child_process').exec
var expect = require('chai').expect

function getOrigFileInfo (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) console.log(err)
      resolve(data)
    })
  })
}

function addNewFileInfo (origData, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) console.log(err)
      resolve({
        origData: origData,
        newData: data
      })
    })
  })
}

function fileReader (originalFile, newFile) {
  return getOrigFileInfo(originalFile).then(origData => {
    return addNewFileInfo(origData, newFile).then(fileBuffers => {
      return new Promise((resolve, reject) => {
        resolve({
          origData: fileBuffers.origData,
          newData: fileBuffers.newData
        })
      })
    })
  })
}

describe('colorTransformer', () => {
  it('should keep the main file properties in tact in the transformed version of the bitmap file', (done) => {
    exec('node transform samples/crayons.bmp', (error, stdout, stderr) => {
      if (error) console.log(error)

      fileReader('./samples/crayons.bmp', './samples/crayons_transformed.bmp').then(fileBuffers => {
        var origHeaderField = fileBuffers.origData.slice(0, 2).toString('ascii')
        var origFileByteLength = fileBuffers.origData.readUIntLE(2, 6)
        var origFileBufferLength = fileBuffers.origData.length
        var origPixelArrayByteOffset = fileBuffers.origData.readUIntLE(10, 4)
        var origDibHeaderByteLength = fileBuffers.origData.readUIntLE(14, 4)

        var newHeaderField = fileBuffers.newData.slice(0, 2).toString('ascii')
        var newFileByteLength = fileBuffers.newData.readUIntLE(2, 6)
        var newFileBufferLength = fileBuffers.newData.length
        var newPixelArrayByteOffset = fileBuffers.newData.readUIntLE(10, 4)
        var newDibHeaderByteLength = fileBuffers.newData.readUIntLE(14, 4)

        expect(newHeaderField).to.equal(origHeaderField)
        expect(newFileByteLength).to.equal(origFileByteLength)
        expect(newFileBufferLength).to.equal(origFileBufferLength)
        expect(newPixelArrayByteOffset).to.equal(origPixelArrayByteOffset)
        expect(newDibHeaderByteLength).to.equal(origDibHeaderByteLength)

        fs.unlink('./samples/crayons_transformed.bmp', (err) => {
          if (err) console.log(err)
          done()
        })
      })
    })
  })

  it('When you use colorTransformer on a file that was created by using colorTransformer, the resulting file should be identical to the original bitmap file', (done) => {
    exec('node transform samples/crayons.bmp', (error, stdout, stderr) => {
      if (error) console.log(error)
      var buffers1
      var buffers2

      fileReader('./samples/crayons.bmp', './samples/crayons_transformed.bmp').then(fileBuffers => {
        buffers1 = fileBuffers

        exec('node transform samples/crayons_transformed.bmp', (error, stdout, stderr) => {
          if (error) console.log(error)

          fileReader('./samples/crayons_transformed.bmp', './samples/crayons_transformed_transformed.bmp').then(fileBuffers => {
            buffers2 = fileBuffers
            var originalFileContent = buffers1.origData.toString('hex')
            var retransformedFileContent = buffers2.newData.toString('hex')
            expect(retransformedFileContent).to.equal(originalFileContent)

            fs.unlink('./samples/crayons_transformed.bmp', (err) => {
              if (err) console.log(err)

              fs.unlink('./samples/crayons_transformed_transformed.bmp', (err) => {
                if (err) console.log(err)
                done()
              })
            })
          })
        })
      })
    })
  })
})
