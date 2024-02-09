const investmentSimulation = {
  form: document.querySelector('#investment-simulation-data-entry'),
  nameInput: document.querySelector('#user-name'),
  nameAlert: document.querySelector('#user-name-alert'),
  paymentInput: document.querySelector('#monthly-payment'),
  paymentAlert: document.querySelector('#monthly-payment-alert'),
  interestInput: document.querySelector('#monthly-interest-rate'),
  interestAlert: document.querySelector('#monthly-interest-rate-alert'),
  periodInput: document.querySelector('#payment-period'),
  periodAlert: document.querySelector('#payment-period-alert'),
  simulateButton: document.querySelector('#simulateInvestment'),
  resultDisplay: document.querySelector('#simulation-results-display'),
  resultParagraph: document.querySelector('#result-paragraph'),
  resetSimulationButton: document.querySelector('#reset-simulation'),

  init: function() {
    this.setPeriodOptions(20)
    this.bindEvents()
  },

  setPeriodOptions: function(years) {
    for(let i = 1; i <= years; i++) {
      const option = document.createElement('option')
      option.value = i
      option.innerText = format.periodYearsText(i)
      this.periodInput.appendChild(option)
    }
  },

  bindEvents: function() {
    this.form.addEventListener('submit', this.fetchSimulationResult.bind(this))
    this.resetSimulationButton.addEventListener('click', this.resetSimulation.bind(this))
  },

  fetchSimulationResult : function(e) {
    e.preventDefault()
    
    const isValid = this.validateEntries()
    if(isValid) {
      this.setLoadingState()
      
      api.getSimulationResult(
        this.paymentInput.value,
        convert.percentageToNumber(this.interestInput.value),
        convert.yearsToMonths(this.periodInput.value)
      )
      .then( response  => { 
        return format.simulationMessageParagraph(
          this.nameInput.value,
          convert.numberToBrlMoney(this.paymentInput.value),
          convert.numberToBrlMoney(response),
          format.periodYearsText(this.periodInput.value),
          convert.numberToPercentageBrl(this.interestInput.value)
        )
      })
      .then(message => {
        this.displaySimulationResult(message)
        this.removeLoadingState()
      })
    }
  },

  validateEntries: function() {
    const regex = {
      name: /[a-zA-Z]{3,}/,
      payment: /^[+-]?([0-9]*[.])?[0-9]+$/,
      interest: /^[+-]?([0-9]*[.])?[0-9]+$/,
      period: /\d/,
    }

    const tests = {
      name: regex.name.test(this.nameInput.value),
      payment: regex.payment.test(this.paymentInput.value),
      interest: regex.interest.test(this.interestInput.value),
      period: regex.period.test(this.periodInput.value)
    }

    tests.name ?
      this.hideAlert(this.nameInput, this.nameAlert) :
      this.displayAlert(this.nameInput, this.nameAlert)

    tests.payment ?
      this.hideAlert(this.paymentInput, this.paymentAlert) :
      this.displayAlert(this.paymentInput, this.paymentAlert)

    tests.interest ?
      this.hideAlert(this.interestInput, this.interestAlert) :
      this.displayAlert(this.interestInput, this.interestAlert)

    tests.period ?
      this.hideAlert(this.periodInput, this.periodAlert) :
      this.displayAlert(this.periodInput, this.periodAlert)

    return !Object.values(tests).includes(false)
  },

  displayAlert: function() {
    [...arguments].forEach(element => {
      if(!element.classList.contains('danger')){
        element.classList.add('danger')
      }
    })
  },

  hideAlert: function() {
    [...arguments].forEach( element => {
      if(element.classList.contains('danger')){
        element.classList.remove('danger')
      }
    })
  },

  displaySimulationResult: function(message) {
    this.resultParagraph.innerHTML = message
    this.hideElement(this.form)
    this.displayElement(this.resultDisplay)
  },

  resetSimulation: function() {
    this.resultParagraph.innerHTML = ''
    this.hideElement(this.resultDisplay)
    this.displayElement(this.form)
  },

  displayElement: function(element) {
    if(element.classList.contains('hidden')) {
      element.classList.remove('hidden')
    }
    if(!element.classList.contains('visible')) {
      element.classList.add('visible')
    }
  },

  hideElement: function(element) {
    if(element.classList.contains('visible')) {
      element.classList.remove('visible')
    }
    if(!element.classList.contains('hidden')) {
      element.classList.add('hidden')
    }
  },

  setLoadingState: function() {
    if(!this.simulateButton.classList.contains('loading')) {
      this.simulateButton.classList.add('loading') 
    }
  },

  removeLoadingState: function(){
    if(this.simulateButton.classList.contains('loading')) {
      this.simulateButton.classList.remove('loading') 
    }
  }
}

const api = {
  url: 'https://api.mathjs.org/v4/',

  setConfigs: function(monthlyPayment, monthlyInterestRate, paymentPeriod) {
    const bodyData = {
      expr: `${monthlyPayment} * (((1 + ${monthlyInterestRate}) ^ ${paymentPeriod} - 1) / ${monthlyInterestRate})`
    }

    this.configs = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(bodyData)
    }
  },

  getSimulationResult: async function(monthlyPayment, monthlyInterestRate, paymentPeriod) {
    this.setConfigs(monthlyPayment, monthlyInterestRate, paymentPeriod)

    return fetch(this.url, this.configs)
      .then(response => response.json())
      .then(response => response.result)
  }
}

const convert = {
  yearsToMonths : (numberOfYears) => {
    return (numberOfYears * 12)
  },

  percentageToNumber : (percentage) => {
    return (percentage / 100)
  },

  numberToPercentageBrl: (value) => {
    const number = parseFloat(value / 100)
    const options = {
      style: "percent",
      minimumFractionDigits:2
    }
    return number.toLocaleString("pt-BR", options)
  },

  numberToBrlMoney: (value) => {
    const number = parseFloat(value)
    const options = {
      style: "currency",
      currency: "BRL"
    }
    return number.toLocaleString("pt-BR", options)
  },
}

const format = {
  simulationMessageParagraph: function(name, payment, result, period, interest) {
    return `
      Olá <strong>${name}</strong>, 
      investindo ${payment} todo mês, 
      você terá ${result} em ${period}, 
      sob uma taxa de ${interest} ao mês.
    `
  },

  periodYearsText: function(qtYears) {
    return `${qtYears} ano${qtYears > 1 ? 's' : ''}`
  },
}

investmentSimulation.init()