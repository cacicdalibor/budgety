//BUDGET CONTROLLER
var budgetController = (function(){ //js module

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0)
      this.percentage = Math.round((this.value / totalIncome) * 100);
    else
      this.percentage = -1;
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current){
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new item obj based on type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      //push
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids, index;
      /*
        We need to loop through all items to determine what is the index of the item that needs to be deleted.
        It doesn't mean that ID and INDEX are same number. Some items might be deleted so index and id does not match.
      */
      var ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id); //returns -1 if it doesn't find the id in ids array.

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      //calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      //if expense is 20 and total income 100, then percentages shoud me this expense 20/total income 100 = 20%

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });

    },
    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercentages;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };

})(); //ENDS BUDGET CONTROLLER

//UI CONTROLLER
var UIController = (function(){

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var num, numSplit, int, dec;
    /*
    + or -, before the number
    exactly 2 decimal points at the end of number
    comma separated for number greater then 1000, or longer then 3 char

    2320.23244 ->  -/+ 2,320.23
    */

    num = Math.abs(num); //returns positive value of number -5 will be 5
    num = num.toFixed(2); //converts Number to Number Object and aplay method. Method ads 2 decimals at the end of number

    //split num to int part and decimal part and store it in array
    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); //input 2310 -> output is 2,310 or input 23100 -> output is 23,100
    }

    dec = numSplit[1];
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //will be inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },
    addListItem: function(obj, type) {
      var html, newHtml, elementContainer;
      //create html string with placeholder text
      if (type === 'inc') {
        elementContainer = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%">' +
            '<div class="item__description">%description%</div>' +
            '<div class="right clearfix">' +
                '<div class="item__value">%value%</div>' +
                '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                '</div>' +
            '</div>' +
        '</div>' ;
      } else {
        elementContainer = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%">' +
            '<div class="item__description">%description%</div>' +
            '<div class="right clearfix">' +
                '<div class="item__value">%value%</div>' +
                '<div class="item__percentage">21%</div>' +
                '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                '</div>' +
            '</div>' +
        '</div>';
      }
      //Replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      //insert th html to the dom
      document.querySelector(elementContainer).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArr;
      //Select all input fields
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //Returns NodeList Object of static elements!
      //convert fields NodeList object to array.
      //call is used for method borrowing from Array native object and aplay slice to fields NodeList
      fieldsArr = Array.prototype.slice.call(fields);
      //Loop through each element of an Array and clear them
      fieldsArr.forEach(function(current, index, array){
        current.value = '';
      });
      //return focus to the first input field wich is the description
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) { //display budget on HTML page
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + '%';
        else
          current.textContent = '---';
      });

    },
    displayMonth: function() {
      var now, months, month, year;
      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth(); //month zero based

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
    },
    changedType: function() {

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ', ' +
        DOMstrings.inputDescription + ', ' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(current){
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})(); //ENDS UI CONTROLLER

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

  }
  var updateBudget = function() {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return the budget
    var budget = budgetCtrl.getBudget();

    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };
  var updatePercentages = function() {
    //1. calculate percentages
    budgetCtrl.calculatePercentages();
    //2. read percentages from the budget controllr
    var percentages = budgetCtrl.getPercentages();
    //3. update the ui
    UICtrl.displayPercentages(percentages);
  };
  var ctrlAddItem = function() {
    var input, newItem;

    //1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) { // !isNaN is redudant in this case. If input.value is greater then 0 then value must be a number, so no need to check that.
      //2. Add the item to the budget CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the input fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. calculate and update percentages
      if (input.type === 'exp') updatePercentages();
    } //end if
  };
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, item, ID;
    //this solution doesn't work in Mozilla
    //itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    function findParent(el, className) {
      //in each iteration target element becomes his first parent element and we check his class attribute
      while((el = el.parentElement) && !el.classList.contains(className)); //true DOM traversing exemple!
      return el;
    }
    item = findParent(event.target, 'item');
    if (item){
      itemID = item.id;
    }

    if(itemID) {
      //itemID `=` inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delete item
      budgetCtrl.deleteItem(type, ID);
      //2. delete item from ui
      UICtrl.deleteListItem(itemID);
      //3. update and show budget
      updateBudget();
      //4. caalculate and update percentages
      if (type === 'exp') updatePercentages();
    }

  };
  return {
    init: function () {
      console.log('App started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
