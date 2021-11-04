
class WorldServer():
    def __init__(self, db, tg):
        self.db = db
        self.tg = tg
    
    def getChunk(self, x, y, radius = 15, generateMissing=False):
        """
        Returns a chunk of the world and relevant game states around a given
        x,y coordinate.

        Assumptions:
            ZoneSize is greater than radius
        """
        x_min = x - radius
        x_max = x + radius
        y_min = y - radius
        y_max = y + radius
        raw_chunk = self.db.query(f"""SELECT * FROM tiles 
                                 WHERE 
                                    x >= {x_min} AND
                                    x <= {x_max} AND
                                    y >= {y_min} AND
                                    y <= {y_max}""")
        if generateMissing:
            if len(raw_chunk) < (radius*2+1)**2:
                corner_states = self.db.query(f"""
                    SELECT 
                        (SELECT type_id FROM tiles where x = {x_min} and y = {y_min}) as TOP_LEFT,
                        (SELECT type_id FROM tiles where x = {x_max} and y = {y_min}) as TOP_RIGHT,
                        (SELECT type_id FROM tiles where x = {x_min} and y = {y_max}) as BOTTOM_LEFT,
                        (SELECT type_id FROM tiles where x = {x_max} and y = {y_max}) as BOTTOM_RIGHT
                """)
                for index,val in enumerate(corner_states[0]):
                    if val is None:
                        xy = self.db.cursor.column_names[index].split(',')
                        print(f"generating terrain near {xy[0]},{xy[1]}")
                        self.tg.generateTerrainNearPoint({xy[0]},{xy[1]})
        
        return {"tiles": raw_chunk}
                    
                        
