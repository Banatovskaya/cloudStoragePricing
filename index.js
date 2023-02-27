// Ціни для калькулятору:
// 1) backblaze.com:
// мінімальний платіж 7$.
// ціна Storage: $0.005.
// ціна Transfer: $0.01.

// 2) bunny.net:
// має бути можливість переключатись між опціями HDD та SSD.
// максимальний платіж 10$.
// ціна Storage:
// HDD - $0.01.
// SSD - $0.02.
// ціна Transfer: будь-яка опція - $0.01.

// 3) scaleway.com:
// має бути можливість переключатись між опціями Multi та Single.
// ціна Storage:
// Multi - 75 GB безкоштовно, потім $0.06.
// Single - 75 GB безкоштовно, потім $0.03.
// ціна Transfer: будь-яка опція - 75 GB безкоштовно, потім $0.02.

// 4) vultr.com:
// мінімальний платіж 5$.
// ціна Storage: $0.01.
// ціна Transfer: $0.01.

let companies = [
    {
        name: "backblaze",
        icon:"icons/backblaze.webp",
        minPayment: 7,
        priceStorage:0.005,
        priceTransfer:0.01
    },
    {
        name: "bunny",
        icon:"icons/bunny.jpg",
        maxPayment: 10,
        priceStorage:{
            toggleValue: 'HDD',
            HDD: 0.01,
            SSD: 0.02
        },
        priceTransfer:0.01
    },
    {
        name: "scaleway",
        icon:"icons/scaleway.webp",
        priceStorage:{
            toggleValue: 'Multi',
            Multi:
                {
                    amountMin: 75,
                    price: 0.06
                },
            Single:
                {
                    amountMin: 75,
                    price: 0.03
                },
        },
        priceTransfer:
            {
                amountMin: 75,
                price: 0.02
            },
    },
    {
        name: "vultr",
        icon:"icons/vultr.png",
        minPayment: 5,
        priceStorage:0.01,
        priceTransfer:0.01
    },
];

const sliderArr = document.querySelectorAll('.ranging');
const storageSlider = sliderArr[0].querySelector('.ranging__input');
const storageMaxValue = storageSlider.getAttribute('max');
const storageValue = sliderArr[0].querySelector('.ranging__value');
const transferSlider = sliderArr[1].querySelector('.ranging__input');
const transferMaxValue = transferSlider.getAttribute('max');
const transferValue = sliderArr[1].querySelector('.ranging__value');
isMouseDown = false;

let amountStorage = +storageSlider.value;
storageValue.innerHTML = `${amountStorage}GB`;
let amountTransfer = +transferSlider.value;
transferValue.innerHTML = `${amountTransfer}GB`;

const providersWrap = document.querySelector('.estimateWrap');
companies.forEach((company) => {
    let toggleValue = company.priceStorage?.toggleValue;
    const radioDataTemplate = (toggleValue) ? `<div class="estimateItem__radioWrap">
                                                                <label>${Object.keys(company.priceStorage)[1]}
                                                                <input type="radio" name=${company.name} checked></input>
                                                                </label>
                                                                <label class="marginLeft20">${Object.keys(company.priceStorage)[2]}
                                                                <input type="radio" name=${company.name} ></input>
                                                                </label>
                                                                </div>` : '';
    const provider = document.createElement("div");
    provider.classList.add('estimateItem');
    provider.innerHTML =   `<div class="estimateItem__name">${company.name}
                            ${radioDataTemplate}
                            </div>
                            <img class="estimateItem__icon" src=${company.icon} alt="icon"></img>
                            <div class="estimateItem__scaleWrap">
                                <div class="estimateItem__scale" style='width:${200}px'></div>
                                <div class="estimateItem__value">$</div>
                        </div>`;
                
    providersWrap.append(provider);

    const radioWrap = provider.querySelector('.estimateItem__radioWrap');
    showPrice(company, provider, amountStorage, amountTransfer);

    radioWrap?.addEventListener('change',(e)=>{
        let text = e.target.parentNode.innerText.slice(0, -1);
        company.priceStorage.toggleValue = text;
        const radioArr = radioWrap.querySelectorAll('input');
        radioArr.forEach(radioInput => radioInput.removeAttribute("checked"));
        if (e.target.tagName == 'LABEL'){
            e.target.firstElementChild.setAttribute("checked",'')
        } else{e.target.setAttribute("checked",'')}
        showPrice(company, provider, amountStorage, amountTransfer);
    })
});

const providersArr = document.querySelectorAll('.estimateItem');

function changeAmountStorage(amount){
    amountStorage = amount;
}

function changeAmountTransfer(amount){
    amountTransfer = amount;
};

function countStoragePrice(company, amountStorage){
    let priceStorage;
    let key = company.priceStorage?.toggleValue;
        if (key) { 
            if (typeof(company.priceStorage[key]) == 'object'){
                if(amountStorage > company.priceStorage[key].amountMin){
                        priceStorage = (amountStorage - company.priceStorage[key].amountMin) * company.priceStorage[key].price
                } else {priceStorage = 0}
            } else {
                priceStorage = company.priceStorage[key] * amountStorage;
            };
        } else {priceStorage = company.priceStorage * amountStorage}
    return priceStorage;
}

function countTransferPrice(company, amountTransfer){
    let priceTransfer;
    if (typeof(company.priceTransfer) =='object'){
        if(amountTransfer > company.priceTransfer.amountMin){
            priceTransfer = (amountTransfer - company.priceTransfer.amountMin) * company.priceTransfer.price;
        } else {priceTransfer = 0}
    } else {priceTransfer = company.priceTransfer * amountTransfer}
    return priceTransfer;
}

function countMaxStoragePrice(company, amountStorage){
    let priceStorage;
    let previousPriceStorage = 0;
    if(typeof(company.priceStorage) == 'object') {    
        for (let key in company.priceStorage){           
                    let item = company.priceStorage[key]     
                if (typeof(item =='object')){
                    if(amountStorage > item.amountMin){
                        priceStorage = (amountStorage - item.amountMin) * item.price
                    } else {priceStorage = 0}
                } else {
                    priceStorage = item * amountStorage;
                }
                if(previousPriceStorage < priceStorage){
                    previousPriceStorage = priceStorage;     
                } else{priceStorage = previousPriceStorage}      
        }
    } else {priceStorage = company.priceStorage * amountStorage}
return priceStorage;
};

function showPrice(company, providerSelector, amountStorage, amountTransfer){
        const price = providerSelector.querySelector('.estimateItem__value');
        let totalPrice = countStoragePrice(company, amountStorage) + countTransferPrice(company, amountTransfer);
        if (company.minPayment > totalPrice){
            totalPrice = company.minPayment;
        } else if (company.maxPayment < totalPrice){
            totalPrice = company.maxPayment;
        } 
        price.innerHTML = `${totalPrice.toFixed(2)}$`;    
        changeScaleWidth(providerSelector, totalPrice);
}

function countMaxWidth(){
    function getMaxPrice(company, amountStorage, amountTransfer){      
        let totalPrice = countMaxStoragePrice(company, amountStorage) + countTransferPrice(company, amountTransfer);
        if (company.minPayment > totalPrice){
            totalPrice = company.minPayment;
        } else if (company.maxPayment < totalPrice){
            totalPrice = company.maxPayment;
        } 
        return +totalPrice.toFixed(2);
    }

    let previousMaxPrice = 0;

    companies.forEach((company)=>{
        let maxPrice = getMaxPrice(company, storageMaxValue, transferMaxValue); 
            if(previousMaxPrice < maxPrice){
            previousMaxPrice = maxPrice;     
        } else{maxPrice = previousMaxPrice}    
    })
    return previousMaxPrice;
}

function changeScaleWidth(provider, totalPrice){
    const scale = provider.querySelector('.estimateItem__scale');
    const width = totalPrice.toFixed(2) * 80/countMaxWidth() ;
    scale.style.width = `${width.toFixed(2)}%`;
}

function moveSlider(slider, divForValue, changeAmountGB){
    slider.addEventListener('mousedown', () => {
        isMouseDown = true;
    });

    slider.addEventListener('mouseup', () => {
        isMouseDown = false;
        changeAmountGB(+slider.value);
        divForValue.innerHTML = `${slider.value}GB`;
        companies.forEach((company, idx) => {
            showPrice(company, providersArr[idx], amountStorage, amountTransfer);
        });  
    });

    slider.addEventListener('mousemove', (e) => {
        if (isMouseDown){
            divForValue.innerHTML = `${slider.value}GB`;
            changeAmountGB(+slider.value);
            companies.forEach((company, idx) => {
                showPrice(company, providersArr[idx], amountStorage, amountTransfer);
            });  
        }
    });
}

moveSlider(storageSlider, storageValue, changeAmountStorage);
moveSlider(transferSlider, transferValue, changeAmountTransfer);
