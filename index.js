const dataType = {
  coffeeDataType: {
    id: "string",
    name: "string",
    price: "number",
    orderable: "boolean",
    image: "string",
  },
  orderDataType: {
    id: "string",
    orderList: "object",
    totalAmount: "number",
    date: "string",
  },
  orderList: {
    id: "string",
    name: "string",
    price: "number",
    quantity: "number",
    totalAmount: "number",
  },
  configType: {
    counter: "number",
    currency: "string",
  },
};

const orderUpdateType = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  COFFEEUPDATE: "COFFEEUPDATE",
  UPDATEQTY: "UPDATEQTY",
  RESET: "RESET",
};

const configStore = new Store({
  counter: 1,
  currency: "MMK",
});

const coffeeStore = new Store([]);

const orderStore = new Store({
  id: getToday("") + configStore.get().counter,
  orderList: [],
  totalAmount: 0,
});

const newCoffeeFormStore = new Store({
  id: "1",
  name: "",
  image: "",
  orderable: true,
  price: 0,
});

const coffeeEditStore = new Store({
  isEdit: false,
  id: "",
  name: "",
  image: "",
  orderable: true,
  price: 0,
});

const transactionStore = new Store([]);

const tabStore = new Store({ name: "coffee-tab" });

function addNewCoffee(name, price) {
  const newData = {
    id: Math.random() + "",
    name: name,
    price: price,
    orderable: true,
    image: "",
  };
  const isValidType = checkIsValidTypes(newData, dataType.coffeeDataType);

  if (!isValidType) {
    console.log("Type is not valid");
    return;
  }

  const coffees = coffeeStore.get();

  const isThereSameName = coffees.some((coffee) => coffee.name === name);
  if (isThereSameName) {
    console.log("Name is not valid");
    return;
  }

  if (price <= 0) {
    console.log("Value is not valid");
    return;
  }

  coffeeStore.update([...coffees, newData]);
  return coffeeStore.get();
}

function updateCoffee(id, dataObj) {
  const coffeeList = coffeeStore.get();
  const findIndex = coffeeList.findIndex((data) => data.id === id);

  if (findIndex === -1) {
    console.log("We didn't find the coffee");
    return;
  }

  const updateCoffeeData = { id, ...dataObj };
  const isValidType = checkIsValidTypes(
    updateCoffeeData,
    dataType.coffeeDataType
  );

  if (!isValidType) {
    console.log("Type is not valid for update coffee");
    return;
  }

  coffeeList[findIndex] = updateCoffeeData;

  coffeeStore.update(coffeeList);
  orderUpdate({
    coffeeId: updateCoffeeData.id,
    type: orderUpdateType.COFFEEUPDATE,
  });
  return coffeeStore.get();
}

function removeCoffee(id) {
  const isValidType = checkIsValidTypes({ id }, { id: "string" });

  if (!isValidType) {
    console.log("Remove coffee id: ", id, " is not valid type");
  }

  const coffeeList = coffeeStore.get();
  coffeeStore.update(coffeeList.filter((coffee) => coffee.id !== id));
  return coffeeStore.get();
}

function orderUpdate({
  coffeeId,
  type = orderUpdateType.INCREMENT,
  changeQty = 0,
}) {
  const orderData = orderStore.get();
  const coffeeList = coffeeStore.get();
  const orderList = orderData.orderList;
  const configs = configStore.get();
  const isIncrement = type === orderUpdateType.INCREMENT;
  const isDecrement = type === orderUpdateType.DECREMENT;
  const isCoffeeOrderUpdate = type === orderUpdateType.COFFEEUPDATE;
  const isUpdateQty = type === orderUpdateType.UPDATEQTY;
  const isReset = type === orderUpdateType.RESET;

  // If reset
  if (isReset) {
    const resetOrder = { ...orderData };
    resetOrder.id = getToday("") + configs.counter;
    resetOrder.orderList = [];
    resetOrder.totalAmount = 0;
    orderStore.update(resetOrder);
    return;
  }

  const findCoffeeIndex = coffeeList.findIndex((data) => data.id === coffeeId);
  if (findCoffeeIndex === -1) {
    console.log("We didn't find the coffee");
    return;
  }

  const coffeeData = coffeeList[findCoffeeIndex];
  const findAlreadyCoffeeIndex = orderList.findIndex(
    (coffee) => coffee.id === coffeeId
  );

  console.log("findAlreadyCoffeeIndex", findAlreadyCoffeeIndex);
  // Already found the coffee in the store
  if (findAlreadyCoffeeIndex !== -1) {
    const updateOrder = { ...orderData };
    const { price, name } = coffeeData;
    const { quantity } = updateOrder.orderList[findAlreadyCoffeeIndex];

    if (isCoffeeOrderUpdate) {
      updateOrder.orderList[findAlreadyCoffeeIndex].name = name;
      updateOrder.orderList[findAlreadyCoffeeIndex].price = price;
      updateOrder.orderList[findAlreadyCoffeeIndex].totalAmount =
        price * quantity;
    }

    if (isIncrement) {
      updateOrder.orderList[findAlreadyCoffeeIndex].quantity += 1;
      updateOrder.orderList[findAlreadyCoffeeIndex].totalAmount =
        price * (quantity + 1);
    }

    if (isDecrement) {
      if (quantity - 1 <= 0) {
        updateOrder.orderList = updateOrder.orderList.filter(
          (coffee) => coffee.id !== coffeeData.id
        );
      } else {
        updateOrder.orderList[findAlreadyCoffeeIndex].quantity -= 1;
        updateOrder.orderList[findAlreadyCoffeeIndex].totalAmount =
          price * (quantity - 1);
      }
    }

    if (isUpdateQty) {
      if (changeQty <= 0) {
        updateOrder.orderList = updateOrder.orderList.filter(
          (coffee) => coffee.id !== coffeeData.id
        );
      } else {
        updateOrder.orderList[findAlreadyCoffeeIndex].quantity = changeQty;
        updateOrder.orderList[findAlreadyCoffeeIndex].totalAmount =
          price * changeQty;
      }
    }

    updateOrder.totalAmount = updateOrder.orderList.reduce((pre, coffee) => {
      return pre + coffee.totalAmount;
    }, 0);

    orderStore.update(updateOrder);
    return;
  }

  if (isIncrement) {
    const updateOrder = { ...orderData };
    const newCoffee = {
      id: coffeeId,
      name: coffeeData.name,
      price: coffeeData.price,
      quantity: 1,
      totalAmount: coffeeData.price,
    };
    updateOrder.orderList = [...updateOrder.orderList, newCoffee];
    updateOrder.totalAmount = updateOrder.orderList.reduce((pre, coffee) => {
      return pre + coffee.totalAmount;
    }, 0);
    orderStore.update(updateOrder);
  }
}

function saveOrder() {
  const configs = configStore.get();
  configStore.update({
    ...configs,
    counter: configs.counter + 1,
  });

  const transactions = transactionStore.get();
  transactionStore.update([orderStore.get(), ...transactions]);

  orderUpdate({ type: orderUpdateType.RESET });
}

/**
 * Utility Functions
 *
 */
function checkIsValidTypes(dataObj, types) {
  const dataKeys = Object.keys(dataObj);
  const typeKeys = Object.keys(types);

  // If Data Lenght is not same as Valid Types Lenght
  if (dataKeys.length !== typeKeys.length) {
    return false;
  }

  const typeValues = Object.values(types);
  const dataValues = Object.values(dataObj);

  // All the keys must be same
  const isValidAllKeys = typeKeys.every((eachTypeKey, i) => {
    if (eachTypeKey !== dataKeys[i]) {
      console.log(
        eachTypeKey,
        " key is not valid.",
        "\nMust be: " + dataKeys[i]
      );
    }
    return eachTypeKey === dataKeys[i];
  });

  if (!isValidAllKeys) {
    return false;
  }

  // Checking Eash Data value is same as Validator types
  const isAllValid = typeValues.every((type, i) => {
    if (type !== typeof dataValues[i]) {
      console.log(
        dataKeys[i] + " [" + typeof dataValues[i] + "]" + " type is not valid.",
        "\nMust be: " + type
      );
    }
    return type === typeof dataValues[i];
  });

  return isAllValid;
}

function Store(data) {
  this.data = data;
  this.subscribeFunc = null;

  this.subscribe = (fn) => {
    this.subscribeFunc = fn;
  };

  this.get = function () {
    return this.data;
  };

  this.notify = () => {
    if (this.subscribeFunc) {
      this.subscribeFunc(this.data);
    }
  };

  this.update = function (updateData) {
    this.data = Array.isArray(updateData) ? [...updateData] : { ...updateData };
    this.notify();
  };
}

// Helper Function
function getToday(sperator = "/") {
  return new Date()
    .toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, sperator);
}

function prettyLog(title, data) {
  console.log("================================");
  console.log("===", title);
  console.log("================================");
  console.log(data);
  console.log("================================\n");
}

//  All Ui Functions
function updateCoffeeUI(containerIDs) {
  for (let index = 0; index < containerIDs.length; index++) {
    const containerID = containerIDs[index];
    const coffeeContainer = document.getElementById(containerID);
    const coffeeList = coffeeStore.get();
    const currency = configStore.get().currency;
    const editingCoffee = coffeeEditStore.get();
    const isEditing = editingCoffee.isEdit;

    coffeeContainer.innerHTML = "";

    coffeeList.forEach((coffee) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.innerHTML = "#";

      const nameTd = document.createElement("td");
      if (coffee.id === editingCoffee.id) {
        const editNameInput = document.createElement("input");
        editNameInput.classList.add("form-control", "form-control-sm");
        editNameInput.value = editingCoffee.name;

        editNameInput.addEventListener("keyup", (e) => {
          editingCoffee.name = e.target.value;
        });
        nameTd.appendChild(editNameInput);
      } else {
        nameTd.innerHTML = coffee.name;
      }

      const priceTd = document.createElement("td");
      if (coffee.id === editingCoffee.id) {
        const editPriceInput = document.createElement("input");
        editPriceInput.classList.add("form-control", "form-control-sm");
        editPriceInput.value = editingCoffee.price;

        editPriceInput.addEventListener("keyup", (e) => {
          editingCoffee.price = e.target.value;
        });
        priceTd.appendChild(editPriceInput);
      } else {
        priceTd.innerHTML = coffee.price + " " + currency;
      }

      const editButton = document.createElement("button");
      editButton.innerHTML = "Edit";
      editButton.classList.add("btn", "btn-success", "btn-sm", "mx-1");
      editButton.addEventListener("click", () => {
        coffeeEditStore.update({ isEdit: true, ...coffee });
      });

      const orderButton = document.createElement("button");
      orderButton.innerHTML = "Order";
      orderButton.classList.add("btn", "btn-primary", "btn-sm", "mx-1");
      orderButton.addEventListener("click", () => {
        orderUpdate({
          coffeeId: coffee.id,
          type: orderUpdateType.INCREMENT,
        });
      });

      const saveButton = document.createElement("button");
      saveButton.innerHTML = "Save";
      saveButton.classList.add("btn", "btn-success", "btn-sm", "mx-2");
      saveButton.addEventListener("click", () => {
        const updatedCoffeeData = { ...coffee };
        updatedCoffeeData.name = editingCoffee.name;
        updatedCoffeeData.price = parseFloat(editingCoffee.price);
        const isUpdated = updateCoffee(coffee.id, updatedCoffeeData);
        if (isUpdated) {
          coffeeEditStore.update({
            isEdit: false,
            ...updatedCoffeeData,
            id: "---",
          });
        }
      });

      const actionTd = document.createElement("td");

      if (isEditing) {
        // Save Button
        if (coffee.id === editingCoffee.id) {
          actionTd.appendChild(saveButton);
        }
      } else {
        actionTd.appendChild(editButton);
      }

      // actionTd.appendChild(disabledButton);

      if (coffee.orderable) {
        actionTd.appendChild(orderButton);
      }

      tr.appendChild(th);
      tr.appendChild(nameTd);
      tr.appendChild(priceTd);
      tr.appendChild(actionTd);

      tr.addEventListener("dblclick", () => {
        coffeeEditStore.update({ isEdit: true, ...coffee });
      });
      coffeeContainer.appendChild(tr);
    });
  }
}

function updateOrderUI() {
  const orderData = orderStore.get();
  const currency = configStore.get().currency;

  const coffeeListContainer = document.getElementById("coffee-list-container");
  coffeeListContainer.innerHTML = "";

  const orderTitle = document.getElementById("order-id");
  orderTitle.innerHTML = orderData.id;

  const orderList = orderData.orderList;
  orderList.map((coffee) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("row", "order-bg");

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("col");
    nameDiv.innerHTML = coffee.name;

    const actionDiv = document.createElement("div");
    actionDiv.classList.add("col", "text-end");

    const actionMinusDiv = document.createElement("div");
    actionMinusDiv.classList.add("btn", "btn-primary", "btn-sm", "mx-1");
    actionMinusDiv.innerHTML = "-";
    actionMinusDiv.addEventListener("click", () => {
      orderUpdate({
        coffeeId: coffee.id,
        type: orderUpdateType.DECREMENT,
      });
    });

    const actionQuantityDiv = document.createElement("input");
    actionQuantityDiv.setAttribute("value", coffee.quantity);
    actionQuantityDiv.setAttribute("type", "number");
    actionQuantityDiv.classList.add("order-input");
    actionQuantityDiv.addEventListener("blur", (e) => {
      orderUpdate({
        coffeeId: coffee.id,
        type: orderUpdateType.UPDATEQTY,
        changeQty:
          e.target.value && !isNaN(e.target.value)
            ? parseInt(e.target.value)
            : coffee.quantity,
      });
    });

    const actionPlusDiv = document.createElement("div");
    actionPlusDiv.classList.add("btn", "btn-primary", "btn-sm", "mx-1");
    actionPlusDiv.innerHTML = "+";
    actionPlusDiv.addEventListener("click", () => {
      orderUpdate({
        coffeeId: coffee.id,
        type: orderUpdateType.INCREMENT,
      });
    });

    actionDiv.appendChild(actionMinusDiv);
    actionDiv.appendChild(actionQuantityDiv);
    actionDiv.appendChild(actionPlusDiv);

    const priceDiv = document.createElement("div");
    priceDiv.classList.add("col", "text-end");
    priceDiv.innerHTML = coffee.totalAmount + " " + currency;

    wrapper.appendChild(nameDiv);
    wrapper.appendChild(actionDiv);
    wrapper.appendChild(priceDiv);

    coffeeListContainer.appendChild(wrapper);
  });

  const totalAmountRowDiv = document.createElement("div");
  totalAmountRowDiv.classList.add("row", "order-bg");

  const colDiv = document.createElement("div");
  colDiv.classList.add("col");

  const totalAmountTextDiv = document.createElement("div");
  totalAmountTextDiv.classList.add("col", "text-center");
  totalAmountTextDiv.innerHTML = "Total Amount";

  const totamAmountPriceDiv = document.createElement("div");
  totamAmountPriceDiv.classList.add("col", "text-end");
  totamAmountPriceDiv.innerHTML = orderData.totalAmount + " " + currency;

  totalAmountRowDiv.appendChild(colDiv);
  totalAmountRowDiv.appendChild(totalAmountTextDiv);
  totalAmountRowDiv.appendChild(totamAmountPriceDiv);

  coffeeListContainer.appendChild(totalAmountRowDiv);

  const saveButton = document.createElement("button");
  saveButton.classList.add("btn", "btn-primary", "btn-lg", "w-100");
  saveButton.innerHTML = "Checkout !";
  saveButton.addEventListener("click", () => {
    if (orderList.length > 0) {
      saveOrder();
    } else {
      alert("Please Input Order");
    }
  });

  coffeeListContainer.appendChild(saveButton);
}

function updateTransactionUI() {
  const transactionContainer = document.getElementById("transaction-container");
  const transactions = transactionStore.get();
  transactionContainer.innerHTML = "";
  const currency = configStore.get().currency;

  transactions.forEach((order) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.innerHTML = "#";

    const orderIdTd = document.createElement("td");
    orderIdTd.innerHTML = order.id;
    const orderDetailTd = document.createElement("td");
    orderDetailTd.innerHTML = order.orderList.reduce((prev, nextOrder) => {
      return `${prev} ${nextOrder.name}_(${nextOrder.quantity}x ${nextOrder.price})`;
    }, "");
    const orderTotalTd = document.createElement("td");
    orderTotalTd.innerHTML = order.totalAmount + " " + currency;

    tr.appendChild(th);
    tr.appendChild(orderIdTd);
    tr.appendChild(orderDetailTd);
    tr.appendChild(orderTotalTd);

    transactionContainer.appendChild(tr);
  });
}

const newCoffeeForm = document.getElementById("add-coffee-form");
newCoffeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Submitted", newCoffeeFormStore.get());

  const newCoffeeData = newCoffeeFormStore.get();

  const isSuccess = addNewCoffee(newCoffeeData.name, newCoffeeData.price);

  if (isSuccess) {
    newCoffeeFormStore.update({
      id: "",
      image: "",
      name: "",
      orderable: true,
      price: 0,
    });
  }
});

const eachNewCoffeeField = document.querySelectorAll(".add-coffee-field");
if (eachNewCoffeeField.length) {
  eachNewCoffeeField.forEach((field) => {
    field.addEventListener("keyup", (e) => {
      const formData = newCoffeeFormStore.get();
      let updateData = { ...formData };
      if (e.target.name === "name") {
        updateData.name = e.target.value;
      }

      if (e.target.name === "price") {
        updateData.price = parseFloat(e.target.value);
      }

      newCoffeeFormStore.update(updateData);
    });
  });
}

const tabLinks = document.querySelectorAll(".nav-link");
if (tabLinks.length) {
  tabLinks.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const value = tab.dataset.value;
      tabStore.update({ name: value });
    });
  });
}

// All Subscribers
const allCoffeeContainers = ["coffee-container"];
coffeeStore.subscribe((data) => {
  updateCoffeeUI(allCoffeeContainers);
  // updateCoffeeLogUI();
  saveStorage("coffeeStore", data);
});

orderStore.subscribe((data) => {
  updateOrderUI();
  // updateLogUI();
  saveStorage("orderStore", data);
});

configStore.subscribe((data) => {
  saveStorage("configStore", data);
});

coffeeEditStore.subscribe((data) => {
  updateCoffeeUI(allCoffeeContainers);
});

newCoffeeFormStore.subscribe((data) => {
  if (eachNewCoffeeField.length) {
    eachNewCoffeeField.forEach((field) => {
      if (field.name === "name") {
        field.value = data.name;
      }
      if (field.name === "price") {
        field.value = data.price === 0 ? "" : data.price;
      }
    });
  }
});

transactionStore.subscribe((data) => {
  updateTransactionUI();
  saveStorage("transactionStore", data);
});

tabStore.subscribe((data) => {
  if (tabLinks.length > 0) {
    tabLinks.forEach((tab) => {
      const value = tab.dataset.value;
      if (value === data.name) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  ["coffee-tab", "transaction-tab"].forEach((tab) => {
    if (tab === data.name) {
      document.getElementById(tab).classList.remove("d-none");
    } else {
      document.getElementById(tab).classList.add("d-none");
    }
  });
});

function updateLogUI() {
  const order = orderStore.get();
  const logContainer = document.getElementById("log-container");
  logContainer.innerHTML = JSON.stringify(order, null, 2);
}

function updateCoffeeLogUI() {
  const coffees = coffeeStore.get();
  const logContainer = document.getElementById("coffee-log-container");
  logContainer.innerHTML = JSON.stringify(coffees, null, 2);
}

function getStorage(keyName) {
  const data = localStorage.getItem(keyName);
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function saveStorage(keyName, value) {
  localStorage.setItem(keyName, JSON.stringify(value));
}

// When After Reloaded Document,
// This function 'll be called
function init() {
  const coffees = getStorage("coffeeStore");
  const order = getStorage("orderStore");
  const transactions = getStorage("transactionStore");
  const configs = getStorage("configStore");

  [coffees, order, transactions].map((data) => {
    console.log(data);
  });

  if (coffees) {
    coffeeStore.update(coffees);
  }

  if (order) {
    orderStore.update(order);
  }

  if (transactions) {
    transactionStore.update(transactions);
  }

  if (configs) {
    configStore.update(configs);
  }

  updateCoffeeUI(allCoffeeContainers);
  updateOrderUI();
  // updateLogUI();
  // updateCoffeeLogUI();
}

init();
