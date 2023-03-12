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

// All Stores
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

/**
 * All Coffee Services
 *
 * Create New Coffee
 * Update Coffee
 * Delete Coffee
 */
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
    alert("Type is not valid");
    return;
  }

  const coffees = coffeeStore.get();

  const isThereSameName = coffees.some((coffee) => coffee.name === name);
  if (isThereSameName) {
    alert("Name is not valid");
    return;
  }

  if (!newData.name && !newData.name.trim()) {
    alert("Name is not valid");
    return;
  }

  if (price <= 0) {
    alert("Value is not valid");
    return;
  }

  coffeeStore.update([...coffees, newData]);

  showNotification("Hey! New Cup of Coffee", `Successfully New: ${name}`);
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

  showNotification(
    `Updated ${dataObj.name}`,
    `Successfully Updated: ${dataObj.name}`
  );
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

/**
 * All Order Services
 *
 * Order Reset
 * Order Increment
 * Order Decrement
 * Order Update
 * Order Update Quantity
 */

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

/**
 * All Transaction Services
 *
 */
function saveOrder() {
  const configs = configStore.get();
  configStore.update({
    ...configs,
    counter: configs.counter + 1,
  });

  const newOrder = orderStore.get();
  const transactions = transactionStore.get();
  transactionStore.update([newOrder, ...transactions]);

  orderUpdate({ type: orderUpdateType.RESET });
  showNotification(
    `Transaction Added: ${newOrder.id}`,
    `Successfully Added New one.`
  );
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

function createEle(configs) {
  const elementName = configs.element ? configs.element : "div";
  const type = configs.type ? configs.type : "";
  const classList =
    configs.classList && configs.classList.length ? configs.classList : [];
  const events = configs.events ? configs.events : {};
  const value = configs.value ? configs.value : "";
  const appends =
    configs.appends && configs.appends.length ? configs.appends : [];

  const initElement = document.createElement(elementName);
  classList.forEach((item) => {
    initElement.classList.add(item);
  });

  initElement.value = value;
  initElement.innerHTML = value;
  initElement.type = type;

  Object.keys(events).map((key) => {
    initElement.addEventListener(key, events[key]);
  });

  appends.map((appendChild) => {
    initElement.appendChild(appendChild);
  });

  return {
    appends: (appendChilds) => {
      appendChilds.map((appendChild) => {
        initElement.appendChild(appendChild);
      });
    },
    element: initElement,
  };
}

function showNotification(
  title = "Coffee Maker",
  body = "Welcome to Coffee Maker!"
) {
  const isSupport = "Notification" in window;
  const options = {
    title,
    body,
    subtitle: body,
    replyPlaceholder: body,
  };

  if (!isSupport) {
    // Os Is not supported
    return;
  }

  prettyLog("Show Notification", options);

  const isAlreadyAccessPermission = Notification.permission === "granted";

  if (isAlreadyAccessPermission) {
    new Notification(title, options);
    return;
  }

  const isNotAccessPermission = Notification.permission !== "denied";

  if (isNotAccessPermission) {
    Notification.requestPermission().then(() => {
      if (Notification.permission === "granted") {
        new Notification(title, options);
      }
    });
  }
}

//  All Ui Update Methods
function updateCoffeeUI(containerIDs) {
  for (let index = 0; index < containerIDs.length; index++) {
    const containerID = containerIDs[index];
    const coffeeContainer = document.getElementById(containerID);
    coffeeContainer.innerHTML = "";
    const coffeeList = coffeeStore.get();
    const currency = configStore.get().currency;
    const editingCoffee = coffeeEditStore.get();
    const isEditing = editingCoffee.isEdit;

    coffeeList.forEach((coffee) => {
      const th = createEle({ element: "th", value: "#" }).element;

      const nameTd = document.createElement("td");
      if (coffee.id === editingCoffee.id) {
        const editNameInput = createEle({
          element: "input",
          classList: ["form-control", "form-control-sm"],
          value: editingCoffee.name,
          events: { keyup: (e) => (editingCoffee.name = e.target.value) },
        }).element;
        nameTd.appendChild(editNameInput);
      } else {
        nameTd.innerHTML = coffee.name;
      }

      const priceTd = document.createElement("td");
      if (coffee.id === editingCoffee.id) {
        const editPriceInput = createEle({
          element: "input",
          classList: ["form-control", "form-control-sm"],
          value: editingCoffee.price,
          events: { keyup: (e) => (editingCoffee.price = e.target.value) },
        }).element;
        priceTd.appendChild(editPriceInput);
      } else {
        priceTd.innerHTML = coffee.price + " " + currency;
      }

      const editButton = createEle({
        element: "button",
        value: "Edit",
        classList: ["btn", "btn-success", "btn-sm", "mx-1"],
        events: {
          click: (e) => coffeeEditStore.update({ isEdit: true, ...coffee }),
        },
      }).element;

      const orderButton = createEle({
        element: "button",
        value: "Order",
        classList: ["btn", "btn-primary", "btn-sm", "mx-1"],
        events: {
          click: (e) =>
            orderUpdate({
              coffeeId: coffee.id,
              type: orderUpdateType.INCREMENT,
            }),
        },
      }).element;

      const saveButton = createEle({
        element: "button",
        value: "Save",
        classList: ["btn", "btn-success", "btn-sm", "mx-2"],
        events: {
          click: () => {
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
          },
        },
      }).element;

      const actionTd = document.createElement("td");
      if (isEditing) {
        // Save Button
        if (coffee.id === editingCoffee.id) {
          actionTd.appendChild(saveButton);
        }
      } else {
        actionTd.appendChild(editButton);
      }

      if (coffee.orderable) {
        actionTd.appendChild(orderButton);
      }

      const tr = createEle({
        element: "tr",
        appends: [th, nameTd, priceTd, actionTd],
        events: {
          // dblclick: () => coffeeEditStore.update({ isEdit: true, ...coffee }),
        },
      }).element;

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
    const nameDiv = createEle({
      classList: ["col"],
      value: coffee.name,
    }).element;

    const actionMinusDiv = createEle({
      classList: ["btn", "btn-primary", "btn-sm", "mx-1"],
      value: "-",
      events: {
        click: () => {
          orderUpdate({
            coffeeId: coffee.id,
            type: orderUpdateType.DECREMENT,
          });
        },
      },
    }).element;

    const actionQuantityDiv = createEle({
      element: "input",
      type: "number",
      value: coffee.quantity,
      classList: ["order-input"],
      events: {
        blur: (e) =>
          orderUpdate({
            coffeeId: coffee.id,
            type: orderUpdateType.UPDATEQTY,
            changeQty:
              e.target.value && !isNaN(e.target.value)
                ? parseInt(e.target.value)
                : coffee.quantity,
          }),
      },
    }).element;

    const actionPlusDiv = createEle({
      classList: ["btn", "btn-primary", "btn-sm", "mx-1"],
      value: "+",
      events: {
        click: () =>
          orderUpdate({
            coffeeId: coffee.id,
            type: orderUpdateType.INCREMENT,
          }),
      },
    }).element;

    const actionDiv = createEle({
      classList: ["col", "text-end"],
      appends: [actionMinusDiv, actionQuantityDiv, actionPlusDiv],
    }).element;

    const priceDiv = createEle({
      classList: ["col", "text-end"],
      value: coffee.totalAmount + " " + currency,
    }).element;

    const wrapper = createEle({
      classList: ["row", "order-bg"],
      appends: [nameDiv, actionDiv, priceDiv],
    }).element;

    coffeeListContainer.appendChild(wrapper);
  });

  const colDiv = createEle({
    classList: ["col"],
  }).element;

  const totalAmountTextDiv = createEle({
    classList: ["col", "text-center"],
    value: "Total Amount",
  }).element;

  const totamAmountPriceDiv = createEle({
    classList: ["col", "text-end"],
    value: orderData.totalAmount + " " + currency,
  }).element;

  const totalAmountRowDiv = createEle({
    classList: ["row", "order-bg"],
    appends: [colDiv, totalAmountTextDiv, totamAmountPriceDiv],
  }).element;

  coffeeListContainer.appendChild(totalAmountRowDiv);

  const saveButton = createEle({
    element: "button",
    classList: ["btn", "btn-primary", "btn-lg", "w-100"],
    value: "Checkout !",
    events: {
      click: () =>
        orderList.length > 0 ? saveOrder() : alert("Please Input Order"),
    },
  }).element;

  coffeeListContainer.appendChild(saveButton);
}

function updateTransactionUI() {
  const transactionContainer = document.getElementById("transaction-container");
  const transactions = transactionStore.get();
  transactionContainer.innerHTML = "";
  const currency = configStore.get().currency;

  transactions.forEach((order) => {
    const th = createEle({
      element: "th",
      value: "#",
    }).element;

    const orderIdTd = createEle({
      element: "td",
      value: order.id,
    }).element;

    const orderDetailTd = createEle({
      element: "td",
      value: order.orderList.reduce((prev, nextOrder) => {
        return `${prev} ${nextOrder.name}_(${nextOrder.quantity}x ${nextOrder.price})`;
      }, ""),
    }).element;

    const orderTotalTd = createEle({
      element: "td",
      value: order.totalAmount + " " + currency,
    }).element;

    const tr = createEle({
      element: "tr",
      appends: [th, orderIdTd, orderDetailTd, orderTotalTd],
    }).element;

    transactionContainer.appendChild(tr);
  });
}

// All Input Listeners
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

// When New Coffee Form Fields are clicked
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

// When Tablinks are clicked
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

/**
 * All LocalStorage Functions
 */
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

  showNotification("Initial Start");
}

init();
