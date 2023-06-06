# TODO

- Allow Stype.List in Layer.parse() could be helpful to be able to use the pacthed layer.parse('...')
directly in the component className without the need to call layer.add('...').parse(). The problem is:
the layer.parse('..') should performa an `add` or a `set`?
- parser.layer() should take params? Sype.List or Stype.Patch[]? This could be very dangerous if you
pass a Stype.List and it is `set` if this layer become a patch it will potentially overwrite complitely
the customized layer!
- could we explore the "write-once" log concept? Instead of using layers we create some "namespaces" (
key-value store) that can only be written once. The component deplare which namespaces it uses and all 
consumer can pass a store with some of those namespaces already set, and since they are "write-once"
they cannot be edited from the component itself.