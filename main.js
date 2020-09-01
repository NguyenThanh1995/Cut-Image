
const Input = new class Input {
   width = 0
   height = 0
   top = 30
   left = 8
   
   kx = 1
   ky = 1
   
   image = new Image
   constructor() {
      this.image.src = "image.jpg"
   }
   update() {
      
      let CW = cw - 16,
          CH = ch - 100
   
      let { width, height } = this.image;
   
      this.kx = this.image.width / CW
      this.ky = this.image.height / CH
   
      if ( this.kx > this.ky ) {
         width /= this.kx
         height /= this.kx
      } else {
         width /= this.ky
         height /= this.ky
      }
   
      this.width = width
      this.height = height
      
      
      this.left = (cw - this.width) / 2
   }
   
   draw() {
      drawImage(
         this.image, 0, 0, this.image.width, this.image.height, this.left, this.top, this.width, this.height
      )
      this.update()
   }
}

const Gird = new class Gird {
   startX = Input.left
   startY = Input.top
   endX = Input.left + 100
   endY = Input.top + 100
   status = [ null, null, null, null ]
   
   countLineGird = 3
   widthArc = 15
   
   map = [
      { x: "startX", y: "startY" },
      { x: "endX", y: "startY" },
      { x: "endX", y: "endY" },
      { x: "startX", y: "endY" }
   ]
   
   drawBg() {
      // top
      begin
         fill("rgba(0, 0, 0, .7)")
         fillRect( Input.left, Input.top, Input.width, this.startY - Input.top )
      close
      // right
      
      begin
         fillRect( this.endX, this.startY, Input.width + Input.left - this.endX, Input.height - this.startY - (Input.height - this.endY) )
      close
      // bottom
      begin
         fillRect( Input.left, this.endY, Input.width, Input.height + Input.top - this.endY )
      close
      //left
      begin
         fillRect( Input.left, this.startY, this.startX - Input.left, Input.height - this.startY - (Input.height - this.endY) )
      close
   }
   
   drawPoint() {
      let lineWidth = 2.5
      let width = this.widthArc
      this.map.forEach(({ x, y }, index) => {
         save
            begin
               rect( this[x] - ( index == 1 || index == 2 ? lineWidth : 0 ), this[y], lineWidth, index < 2 ? +width : -width )
               fill(255)
            close
            begin
               rect( this[x], this[y] - ( index == 2 || index == 3 ? 3 : 0 ), index == 0 || index == 3 ? +width : -width, lineWidth )
               fill(255)
            close
         restore
      })
   }
   
   drawLine() {
      for ( let index = 0; index < this.countLineGird; index++ ) {
         begin
            let x = map(index, 0, this.countLineGird, this.startX, this.endX)
            line( x, this.startY, x, this.endY )
            stroke(255)
         close
         
         begin
            let y = map(index, 0, this.countLineGird, this.startY, this.endY)
            line( this.startX, y, this.endX, y )
            stroke(255)
         close
      }
   }
   
   drawGird() {
      this.drawBg()
      this.drawPoint()
      this.drawLine()
      begin
         rect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY)
         stroke("#fff")
      close
   }
   
   update() {
      
      touches.forEach(touch => {
         this.status.forEach((item, index) => {
            if ( touch.id == item ) {
               let { x, y } = this.map[index]
               
               this[x] = touch.x
               this[y] = touch.y
               
               if ( this.endX - this.startX < this.widthArc * 2 ) {
                  switch ( x ) {
                     case "startX":
                        this.startX = this.endX - this.widthArc * 2
                        break
                     case "endX":
                        this.endX = this.startX + this.widthArc * 2
                        break
                  }
               }
               if ( this.endY - this.startY < this.widthArc * 2 ) {
                  switch ( y ) {
                     case "startY":
                        this.startY = this.endY - this.widthArc * 2
                        break
                     case "endY":
                        this.endY = this.startY + this.widthArc * 2
                        break
                  }
               
               }
            }
         })
      })
      
      
      this.startX = Math.max(this.startX, Input.left)
      this.startY = Math.max(this.startY, Input.top)
      
      this.endX = Math.min(this.endX, Input.left + Input.width)
      this.endY = Math.min(this.endY, Input.top + Input.height)
      
      
      this.drawGird()
   }
   
   init() {
      my(canvas).on(my.fx.over)
      .then(event => {
         getTouchInfo(event).forEach(touch => {
            this.map.forEach((item, index) => {
               if ( PointRectCheck({
                  x: (index == 1 || index == 2 ? -this.widthArc : 0) + this[item.x],
                  y: (index == 2 || index == 3 ? -this.widthArc : 0) + this[item.y],
                  width: this.widthArc,
                  height: this.widthArc
               }, touch.x, touch.y) ) {
                  this.status[index] = touch.id
               }
            })
         })
      })
      .on(my.fx.out)
      .then(event => {
         getTouchInfo(event).forEach(item => {
            this.status.forEach((value, index) => {
               if ( item.id == value ) {
                  this.status[index] = undefined 
               }
            })
         })
      })
   }
}

class Button {
   x = 0
   y = 0
   width = 40
   height = 20
   
   fill = "#00000000"
   stroke = "#000"
   color = "#000"
   innerText = ""
   
   idStart = null
   __storeEvent = {}
   
   constructor(x, y, width = 40, height = 20) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
   }
   init() {
      my(canvas).on(my.fx.over)
      .then(event => {
         getTouchInfo(event).forEach(touch => {
            if ( PointRectCheck(this, touch.x, touch.y) ) {
               this.idStart = touch.id
            }
         })
      })
      .on(my.fx.out)
      .then(event => {
         getTouchInfo(event).forEach(touch => {
            if ( touch.id == this.idStart && PointRectCheck(this, touch.x, touch.y) ) {
               this.idStart = null
               this.dispatch("click")
            }
         })
      })
   }
   
   on(name, callback) {
      if ( !Array.isArray(this.__storeEvent[name]) ) {
         this.__storeEvent[name] = []
      }
      this.__storeEvent[name].push(callback)
   }
   dispatch(name) {
      if ( Array.isArray(this.__storeEvent[name]) ) {
         this.__storeEvent[name].forEach(callback => callback.call(this))
      }
   }
   
   draw() {
      save
         begin
            rect( this.x, this.y, this.width, this.height )
            fill(this.fill)
            stroke(this.stroke)
         close
         
         textAlign("center")
         textBaseline("middle")
         fontSize("16px")
         
         begin
            fill(this.color)
            fillText(this.innerText, this.x + this.width / 2, this.y + this.height / 2)
         close
      restore
   }
}

const ButtonSave = new Button(0, 0, 50, 25)
ButtonSave.innerText = "Save"
ButtonSave.color = "#fff"
ButtonSave.stroke = "#fff"

function setup() {
   createCanvas()
   cw = ww
   ch = wh
   prevent = false // block touch in mobile phone
   Gird.init()
   ButtonSave.init()
   ButtonSave.on("click", () => {
      // create emualate
      let [ width, height ] = [ (Gird.endX - Gird.startX) * Math.max(Input.kx, Input.ky), (Gird.endY - Gird.startY) * Math.max(Input.kx, Input.ky) ]
      
      let context = my(`<canvas width="${width}px" height="${height}px">`).get(0).getContext("2d")
      
      let [ x, y ] = [ Gird.startX - Input.left, Gird.startY - Input.top ]
      
      context.drawImage( Input.image, x, y, width, height, 0, 0, width, height )
      let base64 = context.canvas.toBlob(blob => {
         let a = my("<a>")[0]
         a.href = URL.createObjectURL(blob)
         a.download = Math.random() + ".png"
         a.click()
         URL.revokeObjectURL(a.href)
      })
      context.canvas.remove()
   })
}

function draw() {
   clear()
   background("#141414")
   
   Input.draw()
   Gird.update()
   ButtonSave.draw()
}