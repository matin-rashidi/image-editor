const fileInput = document.querySelector("#uploadImage"),
  deleteImageBtn = document.querySelector("#deleteBtn"),
  downloadBtn = document.querySelector("#downloadBtn"),
  rangeInputs = document.querySelectorAll("#range-input-label"),
  imageSection = document.querySelector(".imageSection"),
  flipers = document.querySelector(".flip-buttons");
let addedImage; //Will be taken after adding image

const filters = {
  brightness: "brightness(100%)",
  blur: "blur(0px)",
  contrast: "contrast(100%)",
  grayscale: "grayscale(0%)",
  hue: "hue-rotate(0deg)",
  invert: "invert(0%)",
  opacity: "opacity(100%)",
  saturate: "saturate(100%)",
  sepia: "sepia(0%)",
};

const flipPosition = {
  verticalFlip: false,
  horizontalFlip: false,
};

let borderRadius; // Will be taken after changing border radius

// This function converts the filters array into a string
const getStringsOfFilters = () => {
  const filtersValue = Object.values(filters);
  let filtersString = "";
  filtersValue.forEach((value) => {
    filtersString += `${value} `;
  });
  return filtersString;
};

// Add image to DOM
fileInput.addEventListener("input", () => {
  const newImg = document.createElement("img");
  const selectedImage = fileInput.files[0];
  const imageSrc = URL.createObjectURL(selectedImage);
  newImg.src = imageSrc;
  newImg.alt = selectedImage.name;
  newImg.className = "added-image";
  if (!!imageSection.children[0]) {
    imageSection.replaceChild(newImg, imageSection.children[0]);
  } else {
    imageSection.appendChild(newImg);
  }
  newImg.onload = () => URL.revokeObjectURL(imageSrc);
  addedImage = document.querySelector(".added-image");
});

// Delete added image
deleteImageBtn.addEventListener("click", () => {
  if (!!addedImage) {
    addedImage.remove();
    fileInput.value = null;
  }
  rangeInputs.forEach((input) => {
   const inputID = input.childNodes[3].id;
   if (inputID === 'brightness' | inputID === 'contrast' | inputID === 'opacity' | inputID === 'saturate') {
    input.childNodes[3].value = 100;
    input.childNodes[5].firstElementChild.innerText = '100';
   } else {
    input.childNodes[3].value = 0;
    input.childNodes[5].firstElementChild.innerText = '0';
   }
  })
});

// Enable filters
const addFilter = ({ id, value }) => {
  if (id === 'radius') {
    borderRadius = value;
    addedImage.style.borderRadius = `${value}px`
  }
  for (const key in filters) {
    if (key === id) {
      if (key === "blur") {
        filters[key] = `blur(${value}px)`;
      } else if (key === "hue") {
        filters[key] = `hue-rotate(${value}deg)`;
      } else {
        filters[key] = `${key}(${value}%)`;
      }
    }
  }
  addedImage.style.filter = getStringsOfFilters();
};
rangeInputs.forEach((input) => {
  input.addEventListener("input", ({ target }) => {
    const valueDisplayPlace = input.childNodes[5].firstElementChild;
    valueDisplayPlace.innerText = target.value;
    !!addedImage && addFilter(target);
  });
});

//flip image
flipers.addEventListener("click", ({ target }) => {
  switch (target.id) {
    case "vertical-flip":
      flipPosition.verticalFlip = !flipPosition.verticalFlip;
      break;
    case "horizontal-flip":
      flipPosition.horizontalFlip = !flipPosition.horizontalFlip;
      break;
    default:
      break;
  }
  flipPosition.horizontalFlip
    ? (addedImage.style.transform = "scaleX(-1)")
    : (addedImage.style.transform = "scaleX(1)");
  flipPosition.verticalFlip
    ? (addedImage.style.transform += "scaleY(-1)")
    : (addedImage.style.transform += "scaleY(1)");
});

// Create canvas and download it
downloadBtn.addEventListener("click", () => {
  const img = document.querySelector(".added-image");
  if (!!img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    // Add border radius
    ctx.beginPath();
    ctx.moveTo(0 + borderRadius, 0);
    ctx.lineTo(0 + canvas.width - borderRadius, 0);
    ctx.quadraticCurveTo(0 + canvas.width, 0, 0 + canvas.width, 0 + borderRadius);
    ctx.lineTo(0 + canvas.width, 0 + canvas.height - borderRadius);
    ctx.quadraticCurveTo(0 + canvas.width, 0 + canvas.height, 0 + canvas.width - borderRadius, 0 + canvas.height);
    ctx.lineTo(0 + borderRadius, 0 + canvas.height);
    ctx.quadraticCurveTo(0, 0 + canvas.height, 0, 0 + canvas.height - borderRadius);
    ctx.lineTo(0, 0 + borderRadius);
    ctx.quadraticCurveTo(0, 0, 0 + borderRadius, 0);
    ctx.closePath();
    ctx.clip();

    ctx.scale(
      flipPosition.horizontalFlip ? -1 : 1,
      flipPosition.verticalFlip ? -1 : 1
    );

    ctx.filter = getStringsOfFilters();
    ctx.save();
      
    ctx.drawImage(
      img,
      flipPosition.horizontalFlip ? canvas.width * -1 : 0,
      flipPosition.verticalFlip ? canvas.height * -1 : 0
    );

    canvas.toBlob((blob) => {
      const link = document.createElement("a");
      link.download = img.alt;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  }
});