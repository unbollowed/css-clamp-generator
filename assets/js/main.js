/* #region Imports */
import {
	restoreInputs,
	formFieldName,
	saveFormFieldData,
	optionName,
	saveOptionData,
	calculateFormula,
	copyOutputButtonName,
	copyOutput,
	updateCheckFormulaLink,
	optionSwapValuesName,
	limitResetInputsButton,
	resetInputsButtonName,
	resetInputs
} from './utils.js'
/* #endregion Imports */


/* #region Local storage */
restoreInputs()

document.addEventListener('input', e => {
	const element = e.target.closest(formFieldName)
	if (!element) return

	saveFormFieldData(element)
})

document.addEventListener('input', e => {
	const element = e.target.closest(optionName)
	if (!element) return

	saveOptionData(element)
})
/* #endregion Local storage */


/* #region Calculate formula */
calculateFormula()

document.addEventListener('input', e => {
	if (!e.target.closest(`${formFieldName}, ${optionName}`)) return
	calculateFormula()
})
/* #endregion Calculate formula */


/* #region Copy output */
document.addEventListener('click', e => {
	if (!e.target.closest(copyOutputButtonName)) return
	copyOutput()
})
/* #endregion Copy output */


/* #region Check formula */
updateCheckFormulaLink()

document.addEventListener('input', e => {
	if (!e.target.closest(`${formFieldName}, ${optionSwapValuesName}`)) return
	updateCheckFormulaLink()
})
/* #endregion Check formula */


/* #region Reset inputs */
limitResetInputsButton()

document.addEventListener('input', e => {
	if (!e.target.closest(formFieldName)) return
	limitResetInputsButton()
})

document.addEventListener('click', e => {
	if (!e.target.closest(resetInputsButtonName)) return

	resetInputs()
	limitResetInputsButton()
	calculateFormula()
	updateCheckFormulaLink()
})
/* #endregion Reset inputs */
