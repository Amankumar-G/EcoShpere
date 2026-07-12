import { EmissionScope } from '@/types/emission-scope.interface';

export function buildScopePathMap(
  scopes: EmissionScope[],
  parentPath = '',
): Record<number, string> {
  return scopes.reduce<Record<number, string>>((paths, scope) => {
    const path = parentPath ? `${parentPath} › ${scope.name}` : scope.name;
    paths[scope.id] = path;
    Object.assign(paths, buildScopePathMap(scope.children ?? [], path));
    return paths;
  }, {});
}
