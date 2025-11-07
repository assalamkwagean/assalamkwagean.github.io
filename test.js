describe("Configuration", function() {
  it("should have getUserData and getUserType functions defined", function() {
    expect(typeof getUserData).toBe('function');
    expect(typeof getUserType).toBe('function');
  });
});
