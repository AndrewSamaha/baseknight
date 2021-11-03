function setupDragging() {
    dragItem = document.querySelector("#draggy");
    container = document.querySelector("#parent");
    mapDiv = document.querySelector("#main")

    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);
    
    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);    
}

function dragStart(e) {
    // initial - mouse position on window
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target === dragItem) {
      active = true;
      preDragX = $('#draggy').position().left
      preDragY = $('#draggy').position().top
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    active = false;
    console.log('drag end')
    console.log('  translating map and draggy to pixel_offset')
    console.log(`  ClientParams.pixel_offset=${ClientParams.pixel_offset_X},${ClientParams.pixel_offset_Y}`)
    
    let DisplacementX = currentX + ClientParams.pixel_offset_X //-preDragX + ClientParams.pixel_offset_X
    let DisplacementY = currentY + ClientParams.pixel_offset_Y //-preDragY + ClientParams.pixel_offset_Y
    console.log(`  total displacement ${DisplacementX}, ${DisplacementY}`)
    dragMap(DisplacementX, DisplacementY)
    
    setTranslate(ClientParams.pixel_offset_X, ClientParams.pixel_offset_Y, mapDiv);
    setTranslate(ClientParams.pixel_offset_X, ClientParams.pixel_offset_Y, dragItem);

    initialX = 0;
    currentX = 0;
    initialY = 0;
    currentY = 0;
    xOffset = 0;
    yOffset = 0;
  }

  function drag(e) {
    if (active) {
    
      e.preventDefault();
    
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX + ClientParams.pixel_offset_X, 
                   currentY + ClientParams.pixel_offset_Y, 
                   mapDiv);
      setTranslate(currentX + ClientParams.pixel_offset_X, 
                   currentY + ClientParams.pixel_offset_Y, 
                   dragItem);
    }
  }

  function dragMap(x, y) {
      let newCursorX = Number(GameState.cursorX) - Math.floor(x / ClientParams.cell_size)
      let newCursorY = Number(GameState.cursorY) - Math.floor(y / ClientParams.cell_size)
      let new_pixel_offset_X = x % ClientParams.cell_size
      let new_pixel_offset_Y = y % ClientParams.cell_size
      console.log('drag map')
      console.log(`  cell_size=${ClientParams.cell_size}`)
      console.log(`  x,y=${x},${y}`)
      console.log(`  new_pixel_offset=${new_pixel_offset_X},${new_pixel_offset_Y}`)
      console.log(`     cursor=${GameState.cursorX},${GameState.cursorY}`)
      console.log(`  newCursor=${newCursorX},${newCursorY}`)
      let cursor_displacement_X = newCursorX - GameState.cursorX
      let cursor_displacement_Y = newCursorY - GameState.cursorY
      //console.log(`displacement=${cursor_displacement_X},${cursor_displacement_Y}   NewCursor=${newCursorX},${newCursorY}     new_pixel_offset=${new_pixel_offset_X},${new_pixel_offset_Y}`)
      GameState.cursorX = newCursorX
      GameState.cursorY = newCursorY
      ClientParams.pixel_offset_X = new_pixel_offset_X
      ClientParams.pixel_offset_Y = new_pixel_offset_Y
      console.log(`     cursor=${GameState.cursorX},${GameState.cursorY}`)
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }