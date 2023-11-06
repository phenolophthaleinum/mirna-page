'''
Author: Maciej Michalczyk
'''

class AliasedDict(dict):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.aliases = {}

    def add_alias(self, alias, key):
        if alias in self.aliases:
            self.aliases[alias].append(key)
        else:
            self.aliases[alias] = [key]
    
    def show_aliases(self, key):
        return [alias for alias, value_of_key in self.aliases.items() if value_of_key == key]
    
    def __getstate__(self):
        return {"aliases": self.aliases, "data": dict(self)}

    def __setstate__(self, state):
        self.aliases = state["aliases"]
        self.update(state["data"])

    def __getitem__(self, key):
        item = self.aliases.get(key, key)
        try:
            return super().__getitem__(item)
        except:
            return [super(AliasedDict, self).__getitem__(itemkey) for itemkey in item]

    def __setitem__(self, key, value):
        if not hasattr(self, 'aliases'):
            self.aliases = {}
        return super().__setitem__(self.aliases.get(key, key), value)