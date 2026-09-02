import {getItemList, getItemDetails, sortSettings, generateSummary} from './itemManagement.mjs';

var RecipeCalculator = function(){
  var selectedItems = [];
  var calculateSummary = document.getElementById('calculate-summary');
  var itemSelection = document.getElementById('item-selection-main');
  var step2 = document.getElementById('step2');
  var inefficientNodeTree = document.getElementById('inefficient-nodetree');
  var inefficientPreview = document.getElementById('inefficient-preview');
  var efficientTable = document.querySelector('#efficient-table tbody');
  
  function buildItemList(){
    var items = getItemList('', sortSettings.label);
    if (items.length === 0){
      for (var i=0; i<5; i++){
        items.push({Id: i, Label: 'Test item ' + i});
      }
    }
    return items.reduce((prevValue, item) => {return prevValue += `<option value=${item.Id}>${item.Label}</option>`}, '<option value=0>-Select an item-</option>');
  }
  const optionsText = buildItemList();

  function buildAddItemButton(){
    var nodeTemplate = document.createElement('a');
    nodeTemplate.setAttribute('onclick', 'recipeCalculator.addItem()');
    nodeTemplate.setAttribute('class', 'ico');
    nodeTemplate.setAttribute('additem', '');
    nodeTemplate.innerHTML = '&#xE109';
    return nodeTemplate;
  }

  function buildItemRow(){
    var nodeTemplate = document.createElement('div');
    nodeTemplate.setAttribute('itemselect', '');
    nodeTemplate.innerHTML = `<select required onchange='recipeCalculator.selectItem(this)' class='item-select'>${optionsText}</select>`;
    nodeTemplate.innerHTML += `<input type='number' placeholder='Total level multiplier' value='1' class='item-multiply' onfocusout='recipeCalculator.selectItem(this, true)' min=1 />`;
    nodeTemplate.innerHTML += `<a onclick='recipeCalculator.removeItem(this)' class='ico' removeitem>&#xE108</a><a onclick='recipeCalculator.addItem()' class='ico' additem>&#xE109</a>`;
    nodeTemplate.innerHTML += `<div itemid=0 mult=0 class='item-quick-rate'>Rate: N/A<br/>Building: N/A</div>`; 
    return nodeTemplate;
  }
  
  function checkItemValid(item){
    return item.Id !== 0 && item.Multiplier >= 1;
  }

  this.selectItem = function(select, isMultiplier=false){
    var itemDiv = select.closest('[itemselect]');
    var item = itemDiv.selectedItem;
    var preview = itemDiv.querySelector('.item-quick-rate');
    

    if (isMultiplier){
      if (isNaN(select.valueAsNumber) || select.valueAsNumber < 1)
         select.value = 1;
      else 
        select.value = Math.ceil(select.valueAsNumber/0.5) * 0.5;
      item.Multiplier = select.valueAsNumber;
    }
    else
      item.Id = parseInt(select.value);

    if (item.Id === 0){
      preview.innerHTML = `Rate: N/A<br/>Building: N/A`
      calculateSummary.setAttribute('disabled', '');
    }
    else{
      var itemDetail = getItemDetails(item.Id);
      preview.innerHTML = `Rate: ${(itemDetail.Base * item.Multiplier).toFixed(2)} / min<br/>Building: ${itemDetail.Building}`
      if (selectedItems.every(checkItemValid))
        calculateSummary.removeAttribute('disabled');
    }
  };
  
  this.addItem = function(){
    var newNode = buildItemRow();
    newNode.selectedItem = {Id: 0, Multiplier: 1};
    document.querySelectorAll('[additem]').forEach(node => {node.remove()});

    selectedItems.push(newNode.selectedItem);
    itemSelection.appendChild(newNode);
    calculateSummary.setAttribute('disabled', '');
  };
  
  this.removeItem = function(button){
    var itemDiv = button.closest('[itemselect]');
    selectedItems.splice(selectedItems.indexOf(itemDiv.selectedItem), 1);

    if (!itemDiv.nextElementSibling){
      var prev = itemDiv.previousElementSibling;
      var ref = prev.querySelector('[removeitem]');
      ref.parentElement.insertBefore(buildAddItemButton(), ref.nextElementSibling);
    }
    
    itemDiv.remove()
    
    if (selectedItems.every(checkItemValid))
        calculateSummary.removeAttribute('disabled');
  };
  
  function label(obj){
    var element = document.createElement('div');
    element.innerHTML = `<span>${obj.Label} (${obj.Building + ' x' + obj.Multiplier})</span>`;
    return element;
  }
  
  function preview(obj){
    var element = document.createElement('div');
    element.innerHTML = `<h2>${obj.Label}</h2>`;
    var details = document.createElement('div');
    details.setAttribute('style', 'margin-left: 30px;');
    details.innerHTML = `Required Rate: ${obj.RawRate.toFixed(2)} / min<br/>Building: ${obj.Building}<br/>Total Required Multiplier: ${obj.Multiplier}`;
    
    if (obj.SubRecipes && obj.SubRecipes.length > 0){
      details.innerHTML += '<br/>Ingredients:';
      var ingredients = document.createElement('ul');
      ingredients.setAttribute('style', 'margin: 0;');
      obj.SubRecipes.forEach(x => {
        ingredients.innerHTML += `<li>${x.Label}: ${x.RawRate.toFixed(2)} / min</li>`;
      });
      details.appendChild(ingredients);
    }
    element.appendChild(details);
    return element;
  }
  
  this.calculateSummary = function(){
    if (!selectedItems.every(checkItemValid))
      return;
    var summary = generateSummary(selectedItems);
    inefficientNodeTree.innerHTML = '';
    inefficientPreview.innerHTML = '';
    nodeTree.createNode(summary.Inefficient, inefficientNodeTree, 'SubRecipes', label, preview, inefficientPreview);
    step2.removeAttribute('disabled');

    console.log(efficientTable);
    efficientTable.innerHTML = '';
    for (var ingredient of summary.Efficient){
      console.log(ingredient);
      var row = document.createElement('tr');
      row.innerHTML = `<td>${ingredient.Label}</td><td>${ingredient.RawRate.toFixed(2) + '/min'}</td><td>${ingredient.Building}</td><td>${ingredient.Multiplier}</td>`;
      efficientTable.appendChild(row)
    }
    console.log(summary)
    //console.log(calc.summary);
  };
  
  this.addItem();
  return this;
}

document.addEventListener('DOMContentLoaded', function(){
  window.recipeCalculator = new RecipeCalculator();
});
