class Autocomplete {
  constructor({
    data,
    rootNode,
    inputNode,
    resultsNode,
    searchFn,
    shouldAutoSelect = false,
    onShow = () => { },
    onHide = () => { }
  } = {}) {
    this.data = data
    this.rootNode = rootNode
    this.inputNode = inputNode
    this.resultsNode = resultsNode
    this.searchFn = searchFn
    this.shouldAutoSelect = shouldAutoSelect
    this.onShow = onShow
    this.onHide = onHide
    this.activeIndex = -1
    this.resultsCount = 0
    this.showResults = false
    this.hasInlineAutocomplete = this.inputNode.getAttribute('aria-autocomplete') === 'both'

    // Setup events
    document.body.addEventListener('click', this.handleDocumentClick)
    this.inputNode.addEventListener('keyup', this.handleKeyup)
    this.inputNode.addEventListener('keydown', this.handleKeydown)
    this.inputNode.addEventListener('focus', this.handleFocus)
    this.resultsNode.addEventListener('click', this.handleResultClick)
  }

  handleDocumentClick = event => {
    if (event.target === this.inputNode || this.rootNode.contains(event.target)) {
      return
    }
    this.hideResults()
  }

  handleKeyup = event => {
    const { key } = event

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Escape':
      case 'Enter':
        event.preventDefault()
        return
      default:
        this.updateResults()
    }

    if (this.hasInlineAutocomplete) {
      switch (key) {
        case 'Backspace':
          return
        default:
          this.autocompleteItem()
      }
    }
  }

  handleKeydown = event => {
    const { key } = event
    let activeIndex = this.activeIndex

    if (key === 'Escape') {
      this.hideResults()
      this.inputNode.value = ''
      return
    }

    if (this.resultsCount < 1) {
      if (this.hasInlineAutocomplete && (key === 'ArrowDown' || key === 'ArrowUp')) {
        this.updateResults()
      } else {
        return
      }
    }

    const prevActive = this.getItemAt(activeIndex)
    let activeItem

    switch (key) {
      case 'ArrowUp':
        if (activeIndex <= 0) {
          activeIndex = this.resultsCount - 1
        } else {
          activeIndex -= 1
        }
        break
      case 'ArrowDown':
        if (activeIndex === -1 || activeIndex >= this.resultsCount - 1) {
          activeIndex = 0
        } else {
          activeIndex += 1
        }
        break
      case 'Enter':
        activeItem = this.getItemAt(activeIndex)
        this.selectItem(activeItem)
        return
      case 'Tab':
        this.checkSelection()
        this.hideResults()
        return
      default:
        return
    }

    event.preventDefault()
    activeItem = this.getItemAt(activeIndex)
    this.activeIndex = activeIndex

    if (prevActive) {
      prevActive.classList.remove('selected')
      prevActive.setAttribute('aria-selected', 'false')
    }

    if (activeItem) {
      this.inputNode.setAttribute('aria-activedescendant', `autocomplete-result-${activeIndex}`)
      activeItem.classList.add('selected')
      activeItem.setAttribute('aria-selected', 'true')
      if (this.hasInlineAutocomplete) {
        // this.inputNode.value = activeItem.querySelector('h3').innerText
      }
    } else {
      this.inputNode.setAttribute('aria-activedescendant', '')
    }
  }

  handleFocus = event => {
    this.updateResults()
  }

  handleResultClick = event => {
    if (event.target && event.target.nodeName === 'LI') {
      this.selectItem(event.target)
    }
  }

  getItemAt = index => {
    return this.resultsNode.querySelector(`#autocomplete-result-${index}`)
  }

  selectItem = node => {
    if (node) {
      this.inputNode.value = node.querySelector('h3').innerText
      this.hideResults()
    }
  }

  checkSelection = () => {
    if (this.activeIndex < 0) {
      return
    }
    const activeItem = this.getItemAt(this.activeIndex)
    this.selectItem(activeItem)
  }

  autocompleteItem = event => { }

  updateResults = async () => {
    this.data = await this.onShow()
    const input = this.inputNode.value
    const results = this.searchFn(this.data)(input)

    this.hideResults()
    if (results.length === 0) {
      return
    }

    this.resultsNode.innerHTML = results.map((result, index) => {
      const isSelected = this.shouldAutoSelect && index === 0
      if (isSelected) {
        this.activeIndex = 0
      }
      return `
    <li
      id='autocomplete-result-${index}'
      class='autocomplete-result${isSelected ? ' selected' : ''}'
      role='option'
      ${isSelected ? "aria-selected='true'" : ''}
    >
    <h3>${result.value}</h3>
    <h5>${result.label}</h5>
    </li>
  `
    }).join('')

    this.resultsNode.classList.remove('hidden')
    this.rootNode.setAttribute('aria-expanded', true)
    this.resultsCount = results.length
    this.shown = true
  }

  hideResults = () => {
    this.shown = false
    this.activeIndex = -1
    this.resultsNode.innerHTML = ''
    this.resultsNode.classList.add('hidden')
    this.rootNode.setAttribute('aria-expanded', 'false')
    this.resultsCount = 0
    this.inputNode.setAttribute('aria-activedescendant', '')
    this.onHide()
  }
}
