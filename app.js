const openMenu = document.querySelector(".openmenu");
const closeMenu = document.querySelector(".closemenu");
const listItem = document.querySelector(".list-item");

openMenu.addEventListener("click", show);
closeMenu.addEventListener("click", close);

function show() {
  listItem.style.display = "flex";
  openMenu.style.display = "none";
  closeMenu.style.display = "block";
}

function close() {
  listItem.style.display = "none";
  openMenu.style.display = "flex";
  closeMenu.style.display = "none";
}

const collectionItem = document.querySelector(".collection-item");
const cartTotal = document.querySelector(".cart-total");
const cartDisplay = document.querySelector(".cart img");
const cartSection = document.querySelector(".cart_section");
const cartRemove = document.querySelector(".cart-remove");
const displayCartItem = document.querySelector(".cart-item");
const totalAmount = document.querySelector(".total-amount-item");
const clear_cart = document.querySelector(".clear_cart");

cartDisplay.addEventListener("click", () => {
  cartSection.classList.add("cart_section_display");
});
cartRemove.addEventListener("click", () => {
  cartSection.classList.remove("cart_section_display");
});

let cart = [];
let buttonDOM = [];

class Product {
  async getProduct() {
    try {
      let result = await fetch("product.json");
      let data = await result.json();

      let product = data.items;

      product = product.map((item) => {
        const { id, image, price, desc } = item;
        return { id, image, price, desc };
      });
      return product;
    } catch (error) {
      console.log(error.message);
    }
  }
}
class Display {
  displayProduct(product) {
    let result = "";
    product.forEach((products) => {
      result += `
                <!-- Single Item -->
                <div class="collection_box" >
                    <img src=${products.image} alt="">
                    <div class="collection_overlay">
                        <div class="price">
                            <h4 class = "nike_shoe"> ${products.desc} </h4>
                            <h3>$${products.price}</h3>
                            <p>Sizes: 41 - 45</p>
                        </div>
                        <button class="add-cart" data-id=${products.id}>
                            <img src="images/icon-cart.svg" alt="" >
                            <p>Add to cart</p>
                        </button>
                    </div>
                </div>
                <!-- End Of Single Item -->
            `;
    });
    collectionItem.innerHTML = result;
  }
  shoeButton() {
    const buttons = [...document.querySelectorAll(".add-cart")];
    buttonDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id == id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", (e) => {
          button.innerHTML = "In Cart";
          button.disabled = true;

          let cartItem = { ...Storage.getProduts(id), amount: 1 };

          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.addCart(cart);
          this.displayCart(cartItem);
        });
      }
    });
  }
  addCart(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    cart.map((item) => {
      tempTotal += 1;
      itemTotal += item.price * item.amount;
    });
    cartTotal.innerText = tempTotal;
    totalAmount.innerText = parseFloat(itemTotal.toFixed(2));
  }

  displayCart(item) {
    const div = document.createElement("div");
    div.classList.add("cart-display");
    div.innerHTML = `
       
        <img src=${item.image} class="cart-img">
        <div class="cart-desc">
            <h3>${item.desc}</h3>
            <p>$${item.price}</p>
            <img src="images/icon-delete.svg" alt="" data-id=${item.id} class="remove_single_item">
        </div>
        <div class="cart-add">
            <img src="images/icon-next.svg" alt="" class="icon-up" data-id=${item.id}>
            <p class="product_total">${item.amount}</p>
            <img src="images/icon-previous.svg" alt="" class="icon-down" data-id=${item.id}>
        </div>
    </div>
 
        `;
    displayCartItem.appendChild(div);
  }
  setApp() {
    cart = Storage.showCart();
    this.addCart(cart);
    this.populateCart(cart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.displayCart(item));
  }
  cartLogic() {
    clear_cart.addEventListener("click", () => {
      this.clearCart();
    });

    displayCartItem.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove_single_item")) {
        let removeItems = e.target;
        let id = removeItems.dataset.id;
        displayCartItem.removeChild(removeItems.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains("icon-up")) {
        let increaseItems = e.target;
        console.log(increaseItems);
        let id = increaseItems.dataset.id;
        let tempItem = cart.find((item) => item.id == id);
        tempItem.amount = tempItem.amount + 1;
        this.addCart(cart);
        Storage.saveCart(cart);
        increaseItems.nextElementSibling.innerHTML = tempItem.amount;
      } else if (e.target.classList.contains("icon-down")) {
        let decreaseItems = e.target;
        console.log(decreaseItems);
        let id = decreaseItems.dataset.id;
        let tempItem = cart.find((item) => item.id == id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          this.addCart(cart);
          Storage.saveCart(cart);
          decreaseItems.previousElementSibling.innerHTML = tempItem.amount;
        } else {
          displayCartItem.removeChild(
            decreaseItems.parentElement.parentElement
          );
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(displayCartItem.children);
    while (displayCartItem.children.length > 0) {
      console.log("cleared");
      displayCartItem.removeChild(displayCartItem.children[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.addCart(cart);
    Storage.saveCart(cart);
    let buttons = this.getSingleButton(id);
    buttons.disabled = false;
    buttons.innerHTML = `
        <img src="images/icon-cart.svg" alt="" >
        <p>Add to cart</p>
        `;
  }
  getSingleButton(id) {
    return buttonDOM.find((button) => button.dataset.id == id);
  }
}
class Storage {
  static saveProduct(product) {
    localStorage.setItem("products", JSON.stringify(product));
  }
  static getProduts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((item) => item.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static showCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const product = new Product();
  const display = new Display();

  display.setApp();

  product
    .getProduct()
    .then((product) => {
      display.displayProduct(product);
      Storage.saveProduct(product);
    })
    .then(() => {
      display.shoeButton();
      display.cartLogic();
    });
});
