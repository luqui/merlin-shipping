#!/usr/bin/python

from Dee import *
import cgi
import cgitb
import pickle
import json
import urllib
import urllib2
cgitb.enable()

print "Content-type: text/html"
print

form = cgi.FieldStorage()

item_types = ['Bags', 'Jars', 'Travel Packs', 'Tuning Forks'];

def __main__():
    if 'submit' in form:
        order = Relation(["Type", "Quantity"], [(typ, form[typ].value) for typ in item_types if typ in form])
        entry = Relation.fromTuple(Tuple(Order=order, Address=format_address(form['address'].value), Name=form['name'].value))
        print entry.renderHTML()
        print "<form><input type='hidden' name='confirm' value='yes'></input><input type='submit' value='Confirm'></input></form>"
    elif 'confirm' in form:
        print "Confirm"
    else:
        print_submit_form()

def format_address(addr):
    url = 'http://maps.googleapis.com/maps/api/geocode/json'
    values = { 'address': addr, 'sensor': 'false' }
    valstr = urllib.urlencode(values)
    req = urllib2.Request(url + "?" + valstr)
    response = urllib2.urlopen(req).read()
    return json.loads(response)['results'][0]['formatted_address']
    

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
        <tr><td>Address</td><td><textarea rows="2" cols="50" name='address'></textarea></td></tr>
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
 </head>
 <body>
"""
__main__()
print "</body></html>"
