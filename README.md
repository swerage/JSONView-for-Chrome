JSONView-for-Chrome with Navigation Additions
===================

This is a fork of the Chrome plugin gildas-lormeau/JSONView-for-Chrome. Some navigation features have been added.

Shortcuts
-------------------------

* Collapse All `ctrl -`
* Expand All `ctrl +`
* Navigate up `up arrow`
* Navigate down `down arrow`
* Navigate up on the same level `shift + up arrow`
* Navigate down on the same level `shift + down arrow`
* Expand/Collapse currently selected property (if expandable/collapsable) `enter`
* Navigate to currently selected property (if anchor) `enter`

If the property name is _href_, _url_ or _template_ and contains either _{?whatever}_ or _{&whatever}_, navigating to the property (or clicking the property name) and then pressing the `enter` key will allow you to edit the href and pressing `enter` again will modify the anchor. This allows you to navigate to it as if it's a normal link. Guess how?
