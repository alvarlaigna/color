/* MIT license */
var convert = require("color-convert"),
    string = require("color-string");

module.exports = Color;

function Color(cssString) {
   var values = {
      rgb: [0, 0, 0],
      hsl: [0, 0, 0],
      hsv: [0, 0, 0],
      cmyk: [0, 0, 0, 0],
      alpha: 1
   };
       
   function getValues(space) {
      var vals = {};
      for (var i = 0; i < space.length; i++) {
         vals[space[i]] = values[space][i];
      }
      if (values.alpha != 1) {
         vals["a"] = values.alpha;
      }
      // {r: 255, g: 255, b: 255, a: 0.4}
      return vals;
   }
       
   function setValues(space, vals) {
      var spaces = {
         "rgb": ["red", "green", "blue"],
         "hsl": ["hue", "saturation", "lightness"],
         "hsv": ["hue", "saturation", "value"],
         "cmyk": ["cyan", "magenta", "yellow", "black"]
      }
      
      var maxes = {
         "rgb": [255, 255, 255],
         "hsl": [360, 100, 100],
         "hsv": [360, 100, 100],
         "cmyk": [100, 100, 100, 100],
      }
      
      var alpha = 1;
      if (space == "alpha") {
         alpha = vals;
      }
      else if (vals.length) {
         // [10, 10, 10]
         values[space] = vals.slice(0, space.length);
         alpha = vals[space.length];
      }
      else if (vals[space[0]] !== undefined) {
         // {r: 10, g: 10, b: 10}
         for (var i = 0; i < space.length; i++) {
           values[space][i] = vals[space[i]];
         }
         alpha = vals.a;
      }
      else if (vals[spaces[space][0]] !== undefined) {
         // {red: 10, green: 10, blue: 10}
         var chans = spaces[space];
         for (var i = 0; i < space.length; i++) {
           values[space][i] = vals[chans[i]];
         }
         alpha = vals.alpha;
      }
      values.alpha = Math.max(0, Math.min(1, alpha || values.alpha));
      if (space == "alpha") {
         return;
      }

      // convert to all the other color spaces
      for (var sname in spaces) {
         if (sname != space) {
            values[sname] = convert[space][sname](values[space])
         }
         // cap values
         for (var i = 0; i < sname.length; i++) {
            values[sname][i] = Math.round(Math.max(0, Math.min(maxes[sname][i], values[sname][i])));
         }
      }
   }

   // parse Color() argument
   if (typeof cssString == "string") {
      var vals = string.getRgba(cssString);
      if (vals) {  
         setValues("rgb", vals);
      }
      else if(vals = string.getHsla(cssString)) {
         setValues("hsl", vals);
      }
   }
   else if (typeof cssString == "object") {
      var vals = cssString;
      if(vals["r"] !== undefined || vals["red"] !== undefined) {
         setValues("rgb", vals)
      }
      else if(vals["l"] !== undefined || vals["lightness"] !== undefined) {
         setValues("hsl", vals)
      }
      else if(vals["v"] !== undefined || vals["value"] !== undefined) {
         setValues("hsv", vals)
      }
      else if(vals["c"] !== undefined || vals["cyan"] !== undefined) {
         setValues("cmyk", vals)
      }
   }
   
   function setSpace(space, args) {
      var vals = args[0];
      if (vals === undefined) {
         // color.rgb()
         return getValues(space);
      }
      // color.rgb(10, 10, 10)
      if (typeof vals == "number") {
         vals = Array.prototype.slice.call(args);        
      }
      setValues(space, vals);
      return color;
   }
   
   function setChannel(space, index, val) {
      if (val === undefined) {
         // color.red()
         return values[space][index];
      }
      // color.red(100)
      values[space][index] = val;
      setValues(space, values[space]);
      return color;     
   }

   var color = {
      rgb: function (vals) {
         return setSpace("rgb", arguments);
      },
      hsl: function(vals) {
         return setSpace("hsl", arguments);
      },
      hsv: function(vals) {
         return setSpace("hsv", arguments);
      },
      cmyk: function(vals) {
         return setSpace("cmyk", arguments);
      },
      
      rgbArray: function() {
         return values.rgb;
      },
      hslArray: function() {
         return values.hsl;
      },
      hsvArray: function() {
         return values.hsv;
      },
      cmykArray: function() {
         return values.cmyk;
      },
      rgbaArray: function() {
         var rgb = values.rgb;
         rgb.push(values.alpha);
         return rgb;
      },
      hslaArray: function() {
         var hsl = values.hsl;
         hsl.push(values.alpha);
         return hsl;
      },
            
      alpha: function(val) {
         if (val === undefined) {
            return values.alpha;
         }
         setValues("alpha", val);
         return color;
      },

      red: function(val) {
         return setChannel("rgb", 0, val);
      },
      green: function(val) {
         return setChannel("rgb", 1, val);
      },      
      blue: function(val) {
         return setChannel("rgb", 2, val);
      },
      hue: function(val) {
         return setChannel("hsl", 0, val);
      },
      saturation: function(val) {
         return setChannel("hsl", 1, val);
      },
      lightness: function(val) {
         return setChannel("hsl", 2, val);
      },
      saturationv: function(val) {
         return setChannel("hsv", 1, val);
      },
      value: function(val) {
         return setChannel("hsv", 2, val);
      },
      cyan: function(val) {
         return setChannel("cmyk", 0, val);
      },
      magenta: function(val) {
         return setChannel("cmyk", 1, val);
      },
      yellow: function(val) {
         return setChannel("cmyk", 2, val);
      },
      black: function(val) {
         return setChannel("cmyk", 3, val);
      },

      hexString: function() {
         return string.hexString(values.rgb);
      },
      rgbString: function() {
         return string.rgbString(values.rgb, values.alpha);
      },
      rgbaString: function() {
         return string.rgbaString(values.rgb, values.alpha);
      },
      percentString: function() {
         return string.percentString(values.rgb, values.alpha);
      },
      hslString: function() {
         return string.hslString(values.hsl, values.alpha); 
      },
      hslaString: function() {
         return string.hslaString(values.hsl, values.alpha);
      },
      keyword: function() {
         return string.keyword(values.rgb, values.alpha);
      },
      
      luminosity: function() {
         // http://www.w3.org/TR/WCAG20/#relativeluminancedef
         var rgb = values.rgb;
         for (var i = 0; i < rgb.length; i++) {
            var chan = rgb[i] / 255;
            rgb[i] = (chan <= 0.03928) ? chan / 12.92
                     : Math.pow(((chan + 0.055) / 1.055), 2.4)
         }
         return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      },
      
      contrast: function(color2) {
         // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
         var lum1 = color.luminosity();
         var lum2 = color2.luminosity();
         if (lum1 > lum2) {
            return (lum1 + 0.05) / (lum2 + 0.05)
         };
         return (lum2 + 0.05) / (lum1 + 0.05);
      },
      
      dark: function() {
         return color.contrast(Color("white")) > color.contrast(Color("black"));
      },
      
      light: function() {
         return !color.dark();
      },
       
      negate: function() {
         var rgb = []
         for (var i = 0; i < 3; i++) {
            rgb[i] = 255 - values.rgb[i];
         }
         setValues("rgb", rgb);
         return color;
      },

      lighten: function(ratio) {
         values.hsl[2] += values.hsl[2] * ratio;
         setValues("hsl", values.hsl);
         return color;
      },

      darken: function(ratio) {
         values.hsl[2] -= values.hsl[2] * ratio;
         setValues("hsl", values.hsl);
         return color;         
      },
      
      saturate: function(ratio) {
         values.hsl[1] += values.hsl[1] * ratio;
         setValues("hsl", values.hsl);
         return color;
      },

      desaturate: function(ratio) {
         values.hsl[1] -= values.hsl[1] * ratio;
         setValues("hsl", values.hsl);
         return color;         
      },    

      greyscale: function() {
         var rgb = values.rgb;
         // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
         var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
         setValues("rgb", [val, val, val]);
         return color;
      },

      clearer: function(ratio) {
         setValues("alpha", values.alpha - (values.alpha * ratio));
         return color;
      },

      opaquer: function(ratio) {
         setValues("alpha", values.alpha + (values.alpha * ratio));
         return color;
      },

      rotate: function(degrees) {
         var hue = values.hsl[0];
         hue = (hue + degrees) % 360;
         hue = hue < 0 ? 360 + hue : hue;
         values.hsl[0] = hue;
         setValues("hsl", values.hsl);
         return color;
      },
      
      mix: function(color2, weight) {
         weight = 1 - (weight || 0.5);
         
         // algorithm from Sass's mix(). Ratio of first color in mix is
         // determined by the alphas of both colors and the weight
         var t1 = weight * 2 - 1,
             d = color.alpha() - color2.alpha();

         var weight1 = (((t1 * d == -1) ? t1 : (t1 + d) / (1 + t1 * d)) + 1) / 2;
         var weight2 = 1 - weight1;
         
         var rgb = color.rgbArray();
         var rgb2 = color2.rgbArray();

         for (var i = 0; i < rgb.length; i++) {
            rgb[i] = rgb[i] * weight1 + rgb2[i] * weight2;
         }
         setValues("rgb", rgb);
         
         var alpha = color.alpha() * weight + color2.alpha() * (1 - weight);
         setValues("alpha", alpha);
         
         return color;
      },

      toJSON: function() {
        return color.rgb();
      }
   }  
   return color;
}