/*=========================================================
 DOM UTILITIES
 =========================================================
 
 helpers para seleção e manipulação do DOM.
 Este modulo deve permanecer independente do framework e DEVE NÃO conter lógica específica de componentes.

 OBS: Se tudo estiver funcionando perfeitamente, tu NÃO MEXER AQUI.
 Caso algo esteja errado, o problema com certeza está em outro lugar.
 Este módlulo deve ser usado apenas para manipulação do DOM, e não para lógica de negócio :)
 =========================================================*/

/** Seleciona o PRIMEIRO elemento que corresponde a um seletor CSS.

@param {string} selector
@param {ParentNode} [parent=document]
@returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector)
}

/** Seleciona TODOS os elementos que correspondem a um seletor CSS.
 @param {string} selector
 @param {ParentNode} [parent=document]
 @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)]
}

/** Cria um elemento HTML.
 
@param {string} tagName
@param {string} [className]
@returns {HTMLElement}
 */
export function createElement(tagName, className = '') {
  const element = document.createElement(tagName)

  if (className) {
    element.className = className
  }

  return element
}
