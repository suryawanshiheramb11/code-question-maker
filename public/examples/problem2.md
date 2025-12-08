# Problem: Reverse String

Given a string `s`, return the reversed string.

## Solution
```javascript
function solution(s) {
  return s.split('').reverse().join('');
}
```

## Tests
1. Input: "hello" -> Expected: "olleh"
2. Input: "world" -> Expected: "dlrow"
