import random
import math
import numpy as np
from sklearn.preprocessing import MinMaxScaler

class TerrainGenerator():
    def __init__(self, db):
        self.db = db
    
    def rand_coeff(self):
        rmax = 1
        m = 0 #- rmax
        c = random.random() * rmax + m
        return round(c,3)

    def rand_denomenator(self):
        rmax = 200
        m = 25
        c = random.random() * rmax + m
        return round(c,3)

    def rand_intercept(self):
        rmax = 100
        c = random.random() * rmax - rmax/2
        return round(c,3)
    
    def generate(self, x, y, coeffs, denom, intercept):
        """Generates a single point given a set of parameters."""
        sum = 0
        num_coeffs = int(len(coeffs)/2)
        for i in range(0,num_coeffs*2,2):
            sum += coeffs[i] * math.cos( x / denom[i] ) + intercept[i]
            sum += coeffs[i+1] * math.cos( y / denom[i+1] ) + intercept[i+1]
        return sum
    
    def getZone(self, x, y):
        """Returns the zone coordinates for a given world coordinate.
           Zone coordinates are world coordinates divided by the game
           parameter ZoneSize."""
        zoneSize = int(self.db.getParameter('ZoneSize'))
        return (zoneSize, math.floor(x/zoneSize), math.floor(y/zoneSize))
    
    def getTileType(self, value, tile_types):
        """Returns the index of the tile_type for a given tile value and
           an array representing the results of 'select * from tile_types;'
        """
        for tile_type in tile_types:
            if value >= tile_type[2] and value <= tile_type[3]:
                return tile_type[0]
        return -1
        
    def writeZoneArray(self, startx, starty, zoneArray):
        """Writes an array of tiles to the tiles table."""
        tile_types = self.db.query('select * from tile_types;')
        tiles = []
        for ix, iy in np.ndindex(zoneArray.shape):
            tiles.append((
                ix + startx, 
                iy + starty, 
                self.getTileType(int(zoneArray[ix, iy]), tile_types)
            ))
        stmt = "insert ignore into tiles (x,y,type_id) VALUES (%s, %s, %s);"
        self.db.cursor.executemany(stmt, list(tiles))
        self.db.connection.commit()
        print(f"{len(tiles)} tiles written")
        
    def generateTerrainNearPoint(self, x, y, save=True):
        """Generates terrain in the zone containing the point x,y
           and saves it to the tile table."""
        zoneSize, startx, starty = self.getZone(x,y)
        startx = startx * zoneSize
        starty = starty * zoneSize
        
        coeff_str = self.db.getWorldState('coeffs')
        denom_str = self.db.getWorldState('denom')
        intercepts_str = self.db.getWorldState('intercepts')

        coeffs = list(map(float,coeff_str.split(',')))
        denom = list(map(float,denom_str.split(',')))
        intercepts = list(map(float,intercepts_str.split(',')))
        
        array = np.zeros((zoneSize,zoneSize))
        start = 0
        for x in range(start,zoneSize+start):
            for y in range(start,zoneSize+start):
                array[y-start][x-start] = self.generate(x+1,y+1, coeffs, denom, intercepts)
        
        if 1:
            array = array.reshape(-1, 1) 
            scaler = MinMaxScaler()
            array = scaler.fit_transform(array)
            array = array * 255
            array = array.astype(int)
            array = array.reshape(zoneSize,zoneSize)
        
        if save:
            self.writeZoneArray(startx, starty, array)

        return array
