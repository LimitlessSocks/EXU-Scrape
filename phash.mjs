function transpose(matrix) {
    var rows = matrix.length;
    var cols = matrix[0].length;

    var transposedMatrix = [];

    for (var j = 0; j < cols; j++) {
        var row = [];
        for (var i = 0; i < rows; i++) {
            row.push(matrix[i][j]);
        }
        transposedMatrix.push(row);
    }

    return transposedMatrix;
}

function dct1d(signal) {
    var l = signal.length;
    var res = [];

    for (var i = 0; i < l; i++) {
        var alpha;

        if (i === 0) {
            alpha = Math.sqrt(1 / l);
        } else {
            alpha = Math.sqrt(2 / l);
        }

        var j = [];
        for (var k = 0; k < l; k++) {
            j[k] = k + 1;
        }

        var summation = 0;
        for (var k = 0; k < l; k++) {
            summation += signal[k] * Math.cos((Math.PI * (2 * (j[k] - 1) + 1) * i) / (2 * l));
        }

        res[i] = alpha * summation;
    }

    return res;
}

function dct(signal) {
    let l = signal.length;
    let res = [];

    for(let k = 0; k < l; k++) {
        res[k] = dct1d(signal[k]);
    }
    // console.log(l, res);

    let resTranspose = transpose(res);
    let resTransformed = [];

    for(let k = 0; k < l; k++) {
        resTransformed[k] = dct1d(resTranspose[k]);
    }

    return transpose(resTransformed);
}

function downscaleImage(imageData, width, height, targetWidth, targetHeight) {
  // Calculate the block size for averaging
  const blockWidth = Math.floor(width / targetWidth);
  const blockHeight = Math.floor(height / targetHeight);

  // Create a new Uint8ClampedArray for the downscaled image
  const downscaledImageData = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  // Iterate over the target image pixels
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let totalA = 0;

      // Iterate over the corresponding block of source image pixels
      for (let srcY = y * blockHeight; srcY < (y + 1) * blockHeight; srcY++) {
        for (let srcX = x * blockWidth; srcX < (x + 1) * blockWidth; srcX++) {
          // Calculate the index in the source image data array
          const srcIndex = (srcY * width + srcX) * 4;

          // Accumulate the RGBA values for averaging
          totalR += imageData[srcIndex];
          totalG += imageData[srcIndex + 1];
          totalB += imageData[srcIndex + 2];
          totalA += imageData[srcIndex + 3];
        }
      }

      // Calculate the average RGBA values
      const averageR = Math.round(totalR / (blockWidth * blockHeight));
      const averageG = Math.round(totalG / (blockWidth * blockHeight));
      const averageB = Math.round(totalB / (blockWidth * blockHeight));
      const averageA = Math.round(totalA / (blockWidth * blockHeight));

      // Calculate the index in the downscaled image data array
      const dstIndex = (y * targetWidth + x) * 4;

      // Set the average RGBA values in the downscaled image
      downscaledImageData[dstIndex] = averageR; // R
      downscaledImageData[dstIndex + 1] = averageG; // G
      downscaledImageData[dstIndex + 2] = averageB; // B
      downscaledImageData[dstIndex + 3] = averageA; // A
    }
  }

  return downscaledImageData;
}

function median(arr) {
  let sorted = [...arr];
  sorted.sort((a, b) => a - b);
  
  let middleIndex = Math.floor(arr.length / 2);
  if (arr.length % 2 === 0) {
    return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
  }
  else {
    return arr[middleIndex];
  }
}

export default function phash(imageObject, hashSize = 8, highFreqFactor = 4) {
    let { image, width, height } = imageObject;
    let targetSize = hashSize * highFreqFactor;
    // TODO: assert not upscaling?
    let resized = downscaleImage(image, width, height, targetSize, targetSize);
    // console.log(resized);
    
    let blocked = [];
    for(let i = 0; i < targetSize/*width*/; i++) {
        let row = [];
        for(let j = 0; j < targetSize/*height*/; j++) {
            let idx = i * targetSize/*height*/ + j;
            idx *= 4;
            let [ r, g, b, a ] = resized.slice(idx, idx + 4);
            row.push((r + g + b) / 3);
        }
        blocked[i] = row;
    }
    let coefficients = dct(blocked);
    let lowCoefficients = coefficients.slice(0, hashSize)
        .map(row => row.slice(0, hashSize));
    let flattened = lowCoefficients.flat();
    let med = median(flattened);
    let difference = flattened.map(el => el > med ? 1 : 0);
    return difference.join("");
}
