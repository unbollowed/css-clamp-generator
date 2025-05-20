/* #region Variables */
export const formFieldName = '.form input'
export const optionName = '[id^="option-"]'
export const copyOutputButtonName = '[data-copy-output]'
export const optionSwapValuesName = '#option-swap-values'
export const resetInputsButtonName = '[data-reset-inputs]'


const decimalCount = 4

const storageKeyFormFields = 'fields'
const storageKeyOptions = 'options'
const formFields = document.querySelectorAll(formFieldName)
const options = document.querySelectorAll(optionName)
const minValueField = document.querySelector('#min-value')
const maxValueField = document.querySelector('#max-value')
const rootFontSizeField = document.querySelector('#root-font-size')
const minValueEndField = document.querySelector('#min-value-end')
const maxValueStartField = document.querySelector('#max-value-start')
const outputText = document.querySelector('.output__text pre')
const copyOutputButton = document.querySelector(copyOutputButtonName)
const checkFormulaButton = document.querySelector('[data-check-formula]')
const optionSwapValues = document.querySelector(optionSwapValuesName)
const optionAddCalc = document.querySelector('#option-add-calc')
const resetInputsButton = document.querySelector(resetInputsButtonName)
/* #endregion Variables */


/* #region Functions */
const dataManager = {
	save: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
	load: key => JSON.parse(localStorage.getItem(key)) || {}
}

const formFieldsDataStorage = dataManager.load(storageKeyFormFields)
const optionsDataStorage = dataManager.load(storageKeyOptions)

export const restoreInputs = () => {
	formFields.forEach(field => field.value = formFieldsDataStorage[field.id] ?? field.dataset.initialValue)
	options.forEach(option => option.checked = optionsDataStorage[option.id] ?? option.checked)
}

export const saveFormFieldData = element => {
	formFieldsDataStorage[element.id] = element.value
	dataManager.save(storageKeyFormFields, formFieldsDataStorage)
}

export const saveOptionData = element => {
	optionsDataStorage[element.id] = element.checked
	dataManager.save(storageKeyOptions, optionsDataStorage)
}

const roundDecimals = (number, decimalCount) => {
	const value = number.toFixed(decimalCount)
	const trailingZeroes = /\.?0+$/

	return value.replace(trailingZeroes, '')
}

const removeLeadingZero = number => {
	const leadingZero = /^0\./
	const value = Math.abs(number).toString().replace(leadingZero, '.')

	return number < 0 ? `-${value}` : value
}

const formatValue = number => {
	const functionStack = [value => roundDecimals(value, decimalCount), removeLeadingZero]
	return functionStack.reduce((previousValue, currentFunction) => currentFunction(previousValue), number)
}

const calculateValues = (minValue, maxValue, minValueEnd, maxValueStart) => {
	const rootFontSize = parseInt(rootFontSizeField.value)

	minValue = rootFontSize * minValue
	maxValue = rootFontSize * maxValue

	let v = (100 * (maxValue - minValue)) / (maxValueStart - minValueEnd)
	let r = (minValueEnd * maxValue - maxValueStart * minValue) / (minValueEnd - maxValueStart)

	if (optionSwapValues.checked) {
		v = (100 * (maxValue - minValue)) / (minValueEnd - maxValueStart)
		r = (maxValueStart * maxValue - minValueEnd * minValue) / (maxValueStart - minValueEnd)
	}

	return { v, r: r / rootFontSize }
}

export const calculateFormula = () => {
	const minValue = parseFloat(minValueField.value.replace(',', '.'))
	const maxValue = parseFloat(maxValueField.value.replace(',', '.'))
	const minValueEnd = parseInt(minValueEndField.value)
	const maxValueStart = parseInt(maxValueStartField.value)
	const { v, r } = calculateValues(minValue, maxValue, minValueEnd, maxValueStart)

	const [minValueFormatted, maxValueFormatted, vFormatted, rFormatted] = [minValue, maxValue, v, r].map(formatValue)

	let preferredValue = `${vFormatted}vw + ${rFormatted}rem`
	const vNull = parseFloat(vFormatted) === 0
	const rNull = parseFloat(rFormatted) === 0

	if (rNull) {
		preferredValue = `${vFormatted}vw`
	}

	let clampArgs = `${minValueFormatted}rem, ${preferredValue}, ${maxValueFormatted}rem`

	if (optionAddCalc.checked && ! vNull && ! rNull) {
		clampArgs = `${minValueFormatted}rem, calc(${preferredValue}), ${maxValueFormatted}rem`
	}

	const formula = `clamp(${clampArgs})`
	let output = formula

	if (vNull) {
		output = `${rFormatted}rem`
	}

	const formulaValues = [minValue, maxValue, v, r]
	const invalidOutput = formulaValues.some(value => {
		const isNotNumber = Number.isNaN(value)
		const isInfinite = !Number.isFinite(value)
		const isScientificNotation = value.toString().includes('e')

		if (isNotNumber || isInfinite) {
			output = 'Invalid values'
			return true
		}

		if (isScientificNotation) {
			output = 'Values too large'
			return true
		}
	})

	copyOutputButton.disabled = invalidOutput
	vNull || invalidOutput ? checkFormulaButton.remove() : copyOutputButton.after(checkFormulaButton)
	options.forEach(option => option.disabled = invalidOutput)
	optionSwapValues.disabled = vNull || invalidOutput
	optionAddCalc.disabled = vNull || rNull || invalidOutput

	outputText.innerText = output
}

export const copyOutput = async () => await navigator.clipboard.writeText(outputText.innerText)

export const updateCheckFormulaLink = () => {
	const minValue = parseFloat(minValueField.value.replace(',', '.'))
	const maxValue = parseFloat(maxValueField.value.replace(',', '.'))
	const rootFontSize = parseInt(rootFontSizeField.value)
	const minValueEnd = parseInt(minValueEndField.value)
	const maxValueStart = parseInt(maxValueStartField.value)
	const { v, r } = calculateValues(minValue, maxValue, minValueEnd, maxValueStart)

	const minValueFormatted = Math.round(rootFontSize * minValue)
	const maxValueFormatted = Math.round(rootFontSize * maxValue)
	const vFormatted = roundDecimals(v, decimalCount)
	const rFormatted = roundDecimals(r, decimalCount)

	const linkBase = 'https://modern-fluid-typography.vercel.app'
	const link = `${linkBase}/?rootFontSize=${rootFontSize}&minSize=${minValueFormatted}&maxSize=${maxValueFormatted}&fluidSize=${vFormatted}&relativeSize=${rFormatted}`
	checkFormulaButton.href = link
}

export const limitResetInputsButton = () => {
	const dataChanged = [...formFields].some(field => {
		if (field.value === field.dataset.initialValue) return
		return true
	})

	resetInputsButton.disabled = !dataChanged
}

export const resetInputs = () => {
	localStorage.removeItem(storageKeyFormFields)
	formFields.forEach(field => field.value = field.dataset.initialValue)
}
/* #endregion Functions */
