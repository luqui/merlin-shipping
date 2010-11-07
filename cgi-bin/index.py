#!/usr/bin/python

from Dee import *
import cgi
import cgitb
import pickle
import json
import base64
cgitb.enable()

print "Content-type: text/html"
print

form = cgi.FieldStorage()

item_types = ['Bags', 'Jars', 'Travel Packs', 'Tuning Forks'];

def __main__():
    if 'submit' in form:
        order = Relation(["Type", "Quantity"], [(typ, form[typ].value) for typ in item_types if typ in form])
        entry = Relation.fromTuple(Tuple(Order=order, Address=form['address'].value, Name=form['name'].value))
        value = base64.b64encode(entry.__repr__())
        print entry.renderHTML()
        print "<form><input type='hidden' name='confirm' value='%(value)s'></input><input type='submit' value='Confirm'></input></form>" % { 'value': value }
    elif 'confirm' in form:
        bvalue = form['confirm'].value
        entry = eval(base64.b64decode(bvalue))
        tab = load_table()
        newtab = tab | entry
        save_table(newtab)
        print newtab.renderHTML()
    else:
        load_table()
        print_submit_form()

def save_table(table):
    with open('database', 'w') as fh:
        fh.write(table.__repr__())

def load_table():
    try:
        fh = open('database', 'r')
        return eval(fh.read())
    except:
        return Relation(["Order", "Name", "Address"], [])

def print_input_table():
    print "<table>"
    print "<tr><td><b>Item Type</b></td><td><b>Quantity</b></td></tr>"
    for i in item_types:
        print "<tr><td>%(type)s</td><td><input type='text' name='%(type)s'></input></td></tr>" % { 'type': i }
    print "</table>"

def print_submit_form():
    print """
      <form>
       <input type="hidden" name="submit" value="yes"></input>
       <table>
        <tr><td>Order Info</td><td>
    """
    print_input_table()

    print """
           </td></tr>
        <tr><td>Name</td><td><input type='text' name='name'></input></td></tr>
        <tr><td>Address</td><td><textarea rows="2" cols="50" name='address' id='address'></textarea><input type='button' id='normalize' value='Normalize'></input></td></tr>
       </table>
       <input type="submit"></input>
      </form>
    """

print """
<html>
 <head>
  <style>
   table { border: 1px solid black }
  </style>
  <script src='http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'></script>
  <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script> 
  <script>


$(function () {
    
    var geocoder = new google.maps.Geocoder();

    $('#normalize').click(function(e) {
        var addr = $('#address').val();
        geocoder.geocode( { 'address': addr }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $('#address').val(results[0].formatted_address);
            }
            else {
                alert("Geocode didn't work: " + status);
            }
        });
    });

});

  </script>
 </head>
 <body>
"""
__main__()
print "</body></html>"
