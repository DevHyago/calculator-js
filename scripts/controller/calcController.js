class CalcController{

   constructor(){

      this._audio = new Audio('click.mp3');
      this._audioOnOff = true;
      this._lastOperator = '';
      this._lastNumber = '';
      this._operation = [];
      this._locale = 'pt-BR';
      this._displayCalcEl = document.querySelector('#result');
      this._dateEl = document.querySelector('#date');
      this._timeEl = document.querySelector('#hour');
      this._currentDate;
      this.initialize();
      this.initButtonsEvents();
      this.initKeyboard();

   }

   async copyToClipboard() {
      await navigator.clipboard.writeText(this.displayCalc)
   }

   initialize(){

      this.setDisplayDateTime();
      setInterval(() => {
         this.setDisplayDateTime();
      }, 1000);   
      this.setLastNumberToDisplay();
      document.querySelector('.btn-ac').addEventListener('dblclick', e =>{
         this.toggleAudio();
      });
   }

   toggleAudio(){
      this._audioOnOff = !this._audioOnOff;
   }

   playAudio(){
      if(this._audioOnOff){
         this._audio.currentTime = 0;
         this._audio.play();
      }
   }

   //Keyboards events
   initKeyboard(){
      document.addEventListener('keyup', e =>{

         this.playAudio();

         switch(e.key){
            case 'Escape':
               this.clearAll();
               break;
            case 'Backspace':
               this.clearEntry();
               break;
            case '%':
            case '/':
            case '*':
            case '-':
            case '+':
               this.addOperation(e.key);
               break;
            case '.':
            case ',':
               this.addDot();
               break;
            case 'Enter':
            case '=':
               this.calc();
               break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
               this.addOperation(parseInt(e.key));
               break;
            case 'c':
               if(e.ctrlKey) this.copyToClipboard();
               break;
         }

      });
   }

   //method to handle multiple events
   addEventListenerAll(element, events, fn){
      events.split(" ").forEach(event => {
         element.addEventListener(event, fn, false);
      });
   }

   clearAll(){
      this._operation = [];
      this._lastNumber = '';
      this._lastOperator = '';
      this.setLastNumberToDisplay();
   }

   clearEntry(){
      this._operation.pop();
      this.setLastNumberToDisplay();
   }

   getLastOperation(){
      return this._operation[this._operation.length-1];
   }

   //changing last array position
   setLastOperation(value){
      this._operation[this._operation.length-1] = value;
   }

   //Checking if it's an operator
   isOperator(value){
      return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
   }

   pushOperation(value){
      this._operation.push(value);

      if(this._operation.length > 3){

         this.calc();

      }
   }

   getResult(){
      try{
         return eval(this._operation.join(""));
      }catch(e){
         setTimeout(() => {
            this.setError();
         }, 1);  
      }
   }

   calc(){

      let last = '';

      this._lastOperator = this.getLastItem(true);

      if(this._operation.length < 3){
         
         let firstItem = this._operation[0];
         this._operation = [firstItem, this._lastOperator, this._lastNumber];

      }

      if(this._operation.length > 3){

         last = this._operation.pop();
         this._lastNumber = this.getResult();
      }else if(this._operation.length == 3 ){

         this._lastNumber = this.getLastItem(false);

      }

      let result = this.getResult();

      if(last == '%'){

         result /= 100;
         this._operation = [result];

      }else{

         this._operation = [result];

         if (last) this._operation.push(last);

      }

      this.setLastNumberToDisplay();

   }

   getLastItem(isOperator = true){

      let lastItem;

      for(let i = this._operation.length - 1; i >= 0; i--){

         if(this.isOperator(this._operation[i]) == isOperator){
            lastItem = this._operation[i];
            break;
         }

      }

      if(!lastItem) {
         lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
      }

      return lastItem;
   }

   setLastNumberToDisplay(){
      let lastNumber = this.getLastItem(false);

      if(!lastNumber) lastNumber = 0;

      this.displayCalc = lastNumber;
   }

   addOperation(value){

      if(isNaN(this.getLastOperation())){
         
         if(this.isOperator(value)){

            //change operator
            this.setLastOperation(value);

         }else{
            this.pushOperation(value);
            this.setLastNumberToDisplay();
         }

      }else{

         if(this.isOperator(value)){
            this.pushOperation(value);
         }else{

            //number
         let newValue = this.getLastOperation().toString() + value.toString();
         this.setLastOperation(newValue);

         this.setLastNumberToDisplay();
         }
         
      }

   }


   setError(){
      this.displayCalc = "Error";
   }

   addDot(){

      let lastOperation = this.getLastOperation();

      if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

      if(this.isOperator(lastOperation) || !lastOperation){
         this.pushOperation('0.');
      }else{
         this.setLastOperation(lastOperation.toString() + '.');
      }

      this.setLastNumberToDisplay();

   }

   //Action Buttons
   execBtn(value){

      this.playAudio();

      switch(value){
         case 'ac':
            this.clearAll();
            break;
         case 'ce':
            this.clearEntry();
            break;
         case 'percent':
            this.addOperation('%');
            break;
         case 'division':
            this.addOperation('/');
            break;
         case 'multiplication':
            this.addOperation('*');
            break;
         case 'subtraction':
            this.addOperation('-');
            break;
         case 'sum':
            this.addOperation('+');
            break;
         case 'point':
            this.addDot();
            break;
         case 'equals':
            this.calc();
            break;
         case '0':
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
            this.addOperation(parseInt(value));
            break;
         default:
            this.setError();
            break;
      }
   }

   //adding events to buttons
   initButtonsEvents(){

      let buttons = document.querySelectorAll("#buttons > div");

      buttons.forEach(btn => {

         this.addEventListenerAll(btn, 'click drag', e =>{

            let textBtn = btn.className.replace('button btn-', "");
            
            this.execBtn(textBtn);

         });

      });

   }

   setDisplayDateTime(){
      this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
         day: "2-digit",
         month: "long",
         year: "numeric"
      });
      this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
   }

   /* methods get's and set's */
   get displayTime(){
      return this._timeEl.innerHTML;
   }

   set displayTime(value){
      this._timeEl.innerHTML = value;
   }

   get displayDate(){
      return this._dateEl.innerHTML;
   }

   set displayDate(value){
      this._dateEl.innerHTML = value;
   }

   get displayCalc(){
      return this._displayCalcEl.innerHTML;
   }

   set displayCalc(value){

      if(value.toString().length > 10){
         this._displayCalcEl.style.fontSize = '30px';
      }else if(value.toString().length > 20){
         this.setError();
         return false;
      }

      this._displayCalcEl.innerHTML = value;
   }

   get currentDate(){
      return new Date();
   }

   set currentDate(value){
      this._currentDate = value;
   }


}