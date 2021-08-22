const HISTORY_STORAGE_KEY = 'history',
    DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    POINT = '.',
    MULTIPLICATION = 'x',
    DIVISION = '÷',
    PLUS = '+',
    MINUS = '-',
    SIGNS = [MULTIPLICATION, DIVISION, PLUS, MINUS];


let input = document.getElementById('textInput'),
    historyContentWindow = document.getElementById('historyText'),
    digitElements = document.getElementsByClassName('digitals'),
    signElements = document.getElementsByClassName('signs'),
    point = document.getElementById('point'),
    correct = document.getElementById('correct'),
    correctElem = document.getElementById('correctElem'),
    equals = document.getElementById('equals'),
    historyContent = document.getElementsByClassName('application__history')[0],
    calculatorWindowLock = document.getElementsByClassName('history__window')[0];

function onload() {
    point.disabled = false;
    for (let i = 0; i < digitElements.length; i++) {
        digitElements[i].addEventListener('click', onDigitalClick)
    }
    for (let i = 0; i < signElements.length; i++) {
        signElements[i].addEventListener('click', onSignClick)
    }
    point.addEventListener('click', onPointClick);
    correct.addEventListener('click', onCorrectClick);
    correctElem.addEventListener('click', onCorrectElemClick);
    equals.addEventListener('click', onCalculateDecision);
    fillContentHistory()
}

function limiter(input) {
    if (input.length >= 17) {
        alert('Oops place is over!');
        return false;
    } else {
        return true;
    }
}

function onDigitalClick(event) {
    if (limiter(input.value)) {
        input.value = input.value + event.target.innerText;
    } else {
        return input.value;
    }
}

function onSignClick(event) {
    const value = input.value;
    if (isSign(value[value.length - 1])) {
        input.value = `${value}${event.target.innerText}`;
        point.disabled = false;
    }
}

function isSign(char) {
    return DIGITS.includes(char);
}

function onPointClick() {
    let value = input.value,
        lastValue = (value[value.length - 1]);
    if (value !== '') {
        input.value = `${value}${POINT}`;
        point.disabled = true;
        if (SIGNS.includes(lastValue)) {
            input.value = `${value}${0}${POINT}`;
        }
    } else if (value === '') {
        input.value = `${value}${0}${POINT}`;
    }
}

function onCorrectClick() {
    input.value = input.value.substr(0, input.value.length - 1); // substr
}

function onCorrectElemClick() {
    input.value = '';
}

function onClickHistory() {
    let historyButton = document.getElementsByClassName('history__button')[0];
    if (historyButton.innerHTML === 'HISTORY') {
        historyButton.innerHTML = '×';
    } else {
        historyButton.innerHTML = 'HISTORY';
    }
    historyButton.classList.toggle('history__button-active');
    launchHistory();
}

function launchHistory() {
    historyContent.classList.toggle('application__history-active');
    calculatorWindowLock.classList.toggle('history__window-lock');
}

function fillContentHistory() {
    historyContentWindow.innerHTML = '';
    const historyFromStorage = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!historyFromStorage) {
        return;
    }
    JSON.parse(historyFromStorage).forEach(function(historyElem) {
        const currentNode = document.createElement('div');
        currentNode.innerText = historyElem;
        historyContentWindow.appendChild(currentNode);
    });
}

function cleanHistory() {
    historyContentWindow.innerHTML = '';
    localStorage.removeItem(HISTORY_STORAGE_KEY);
}

function onCalculateDecision() {
    let example = input.value,
        result = checkResult(),
        currentHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    currentHistory.push(`${example}=${result}`);
    input.value = result;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(currentHistory));
    fillContentHistory();
}

function resultForExample() {
    let string = input.value;
    const { signs, digits } = getNumbersAndSigns(string); // destructure js (props maybe)

    return calculate(signs, digits);
}

function checkResult() {
    let string = (resultForExample()).toString();
    let result;
    if (!string.includes(POINT)) {
        return string;
    } else {
        string = Number(string).toFixed(3);
        string = string.toString();
        result = deleteAnExtraDigit(string);
        return result;
    }
}

function deleteAnExtraDigit(string) {
    if (string.includes(POINT)) {
        while (findAnExtraDigit(string)) {
            string = string.slice(0, -1);
        }
        return string;
    } else {
        return string;
    }
}

function findAnExtraDigit(string) {
    if (string.includes(POINT)) {
        return (string[string.length - 1] === string[string.length - 2]) ||
            (string[string.length - 1] === '0') || (string[string.length - 1] === POINT);
    } else {
        return false;
    }
}

function getNumbersAndSigns(input) {
    const digits = [],
        signs = [];
    let previousElemWasSign = false;
    for (let i = 0; i < input.length; i++) {
        if (DIGITS.includes(input[i]) || input[i].includes(POINT)) {
            if (digits.length === 0) {
                digits.push(input[i]);
            } else {
                if (!previousElemWasSign) {
                    let lastElem = digits[digits.length - 1];
                    if (!input[i].includes(POINT)) {
                        digits[digits.length - 1] = lastElem + parseFloat(input[i]);
                    } else {
                        digits[digits.length - 1] = `${lastElem}.`;
                    }
                } else {
                    previousElemWasSign = false;
                    digits.push(input[i]);
                }
            }
        } else {
            signs.push(input[i]);
            previousElemWasSign = true;
        }
    }
    return {
        signs,
        digits
    };
}

function calculate(signs, digits) {
    const signsCopy = [...signs],
        digitsCopy = [...digits];
    return calculateRecursive(signsCopy, digitsCopy);
}

function calculateRecursive(signs, digits) {
    let result;
    if (!signs.includes(DIVISION) && !signs.includes(MULTIPLICATION)) {
        result = calculatePlusMinus(signs, digits);
    } else {
        for (let i = 0; i < signs.length; i++) {
            if (signs[i] === DIVISION || signs[i] === MULTIPLICATION) {
                const sign = signs[i],
                    digitOne = parseFloat(digits[i]),
                    digitTwo = parseFloat(digits[i + 1]);
                let calculationResult;
                if (sign === DIVISION) {
                    calculationResult = digitOne / digitTwo;
                } else {
                    calculationResult = digitOne * digitTwo;
                }
                digits.splice(i, 2, calculationResult);
                signs.splice(i, 1);

                if (signs.length < 1) {
                    result = calculationResult;
                } else {
                    result = calculate(signs, digits);
                    break;
                }
            }
        }
    }

    return result;
}

function calculatePlusMinus(signs, digits) {
    let result;
    if (signs[0] === PLUS || signs[0] === MINUS) {
        const currentSign = signs[0],
            digitOne = parseFloat(digits[0]),
            digitTwo = parseFloat(digits[1]);
        let calculationResult;
        if (currentSign === PLUS) {
            calculationResult = digitOne + digitTwo;
        } else {
            calculationResult = digitOne - digitTwo;
        }
        digits.splice(0, 2, calculationResult);
        signs.splice(0, 1);

        if (signs.length < 1) {
            result = calculationResult;
        } else {
            result = calculatePlusMinus(signs, digits);
        }
    }
    return result;
}

window.addEventListener('load', onload);