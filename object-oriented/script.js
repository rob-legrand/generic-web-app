/*jslint browser: true, indent: 3 */

// Here's a generic web app that uses model/view/controller code organization and web storage.

// All the code below will be run once the page content finishes loading.
document.addEventListener('DOMContentLoaded', function () {
   'use strict';
   var createToDoList;

   // Create a factory that makes an object to keep track of a to-do list.
   createToDoList = function (oldState) {
      var self, state;

      // Create a default starting state with an empty to-do list.
      state = {
         list: []
      };
      // If there's a valid previous state, use it instead.
      if (typeof oldState === 'string') {
         try {
            state = JSON.parse(oldState);
         } catch (ignore) {
         }
      }

      // The self object contains public methods.
      self = {
         addItem: function (item) {
            // Add a new item to the end of the list.
            state.list.push(item);
         },
         getItem: function (whichItem) {
            // Return the desired item from the list.
            return state.list[whichItem];
         },
         getNumItems: function () {
            // Return the number of items in the list.
            return state.list.length;
         },
         getState: function () {
            // Return a string representation of the state object, to be used for web storage.
            return JSON.stringify(state);
         },
         removeItem: function (whichItem) {
            // Remove an item from anywhere in the list.
            state.list = state.list.slice(0, whichItem).concat(state.list.slice(whichItem + 1));
         }
      };
      // Normally it's best to freeze the self object to keep it from being modified later.
      return Object.freeze(self);
   };

   // Create a new closure to hide the view and controller from the model code above.
   (function () {
      var toDoList, updateToDoList;

      // Create a function that updates everything that needs updating whenever the model changes.
      updateToDoList = function () {
         var liElement, toDoListOutputElement, whichItem;

         // Save the new state in web storage (if available).
         localStorage.setItem('generic web app', toDoList.getState());

         // Update the view.
         toDoListOutputElement = document.querySelector('#to-do-list-output');
         // Empty the #to-do-list-output element of all child elements.
         while (toDoListOutputElement.hasChildNodes()) {
            toDoListOutputElement.lastChild.remove();
         }
         // Insert the list items as new li elements one by one.
         for (whichItem = 0; whichItem < toDoList.getNumItems(); whichItem += 1) {
            // Create a new li element in HTML and insert it just inside the end of the list.
            liElement = document.createElement('li');
            liElement.textContent = toDoList.getItem(whichItem);
            toDoListOutputElement.appendChild(liElement);
         }

         // Update the controller:  Add a click handler to each new li element.
         Array.from(toDoListOutputElement.querySelectorAll('li')).forEach(function (element, whichItem) {
            element.addEventListener('click', function () {
               // Update the model.
               toDoList.removeItem(whichItem);
               // Update everything else based on the new model state.
               updateToDoList();
            }, false);
         });
      };

      // Set up the controller:  Handle adding a new to-do list item.
      document.querySelector('#add-to-do-list-item').addEventListener('click', function () {
         var itemToAdd;
         // Update the model.
         itemToAdd = document.querySelector('#to-do-list-item-to-add').value;
         if (itemToAdd.length > 0) {
            toDoList.addItem(itemToAdd);
         }
         // Update everything else based on the new model state.
         updateToDoList();
      }, false);

      // When the page is loaded, get any saved state from web storage and use it to create a new model.
      toDoList = createToDoList(localStorage.getItem('generic web app'));
      // Update everything else based on the new model state.
      updateToDoList();
   }());
}, false);
